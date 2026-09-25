import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { PACKS } from "@/lib/packs";

// Signature Stripe verifiee sur le corps brut (pas de JSON.parse avant) --
// necessite le runtime Node, pas Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * client_reference_id des Payment Links MargeMax est construit par
 * lib/stripe-links.ts comme "<packKey>:<userId>" -- un seul champ
 * disponible sur un Payment Link statique, donc les deux valeurs y sont
 * encodees ensemble. userId est un UUID Supabase (peut contenir des
 * tirets), packKey ne contient jamais ":" -- split sur le premier ":"
 * uniquement.
 */
function parseClientReferenceId(
  value: string | null
): { packKey: string; userId: string } | null {
  if (!value) return null;
  const separatorIndex = value.indexOf(":");
  if (separatorIndex === -1) return null;
  const packKey = value.slice(0, separatorIndex);
  const userId = value.slice(separatorIndex + 1);
  if (!packKey || !userId) return null;
  return { packKey, userId };
}

/** Issue du traitement d'un checkout.session.completed. */
type CheckoutOutcome =
  | { status: "credited" }
  | { status: "ignored"; reason: string };

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * userId + pack : d'abord `client_reference_id` ("<packKey>:<userId>"), sinon
 * `metadata.userId` / `metadata.packKey` (sessions creees avec des metadonnees).
 */
function resolveUserAndPack(
  session: Stripe.Checkout.Session
): { packKey: string; userId: string } | null {
  const fromReference = parseClientReferenceId(session.client_reference_id);
  if (fromReference) return fromReference;

  const userId = session.metadata?.userId;
  const packKey = session.metadata?.packKey;
  if (userId && packKey) return { packKey, userId };
  return null;
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: AdminClient
): Promise<CheckoutOutcome> {
  const parsed = resolveUserAndPack(session);
  if (!parsed) {
    console.error(
      "[webhook stripe] Identifiant utilisateur/pack absent (client_reference_id et metadata.userId), session",
      session.id
    );
    return { status: "ignored", reason: "identifiant utilisateur absent" };
  }

  const pack = PACKS.find((p) => p.key === parsed.packKey);
  if (!pack) {
    console.error("[webhook stripe] Pack inconnu :", parsed.packKey, "session", session.id);
    return { status: "ignored", reason: "pack inconnu" };
  }

  // Le montant reellement encaisse est lu depuis la session Stripe (source
  // de verite), jamais depuis un calcul client.
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "eur";

  // FAILLE CORRIGEE : client_reference_id (donc `parsed.packKey`) transite par
  // l'URL du Payment Link -- un attaquant pourrait ouvrir le lien du pack le
  // MOINS CHER puis modifier ?client_reference_id=ultimate:... avant de payer.
  // Stripe ne valide jamais cette coherence : sans ce controle, le webhook
  // aurait credite le pack DECLARE quel que soit le montant REELLEMENT
  // encaisse. Tolerance minime pour les ecarts d'arrondi legitimes.
  const expectedAmountCents = Math.round(pack.priceEuros * 100);
  const AMOUNT_TOLERANCE_CENTS = 2;
  if (Math.abs(amountTotal - expectedAmountCents) > AMOUNT_TOLERANCE_CENTS) {
    console.error(
      "[webhook stripe] Montant encaissé incohérent avec le pack déclaré -- crédit BLOQUÉ (URL de Payment Link modifiée ou tentative de fraude) :",
      { session: session.id, packKey: pack.key, expectedAmountCents, amountTotalCents: amountTotal }
    );
    return { status: "ignored", reason: "montant incohérent" };
  }

  // L'utilisateur doit exister AVANT toute ecriture (insertion + credit).
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", parsed.userId)
    .maybeSingle();

  if (profileError) {
    console.error("[webhook stripe] Lecture du profil impossible :", profileError);
    throw new Error("lecture du profil échouée");
  }
  if (!profile) {
    console.error(
      "[webhook stripe] Utilisateur introuvable -- paiement encaissé SANS crédit, à traiter manuellement :",
      { session: session.id, userId: parsed.userId, packKey: pack.key, amountTotal }
    );
    return { status: "ignored", reason: "utilisateur introuvable" };
  }

  // Deuxieme filet d'idempotence : la contrainte unique sur
  // stripe_session_id refuse un doublon meme si stripe_webhook_events
  // avait laisse passer cet evenement.
  const { error: insertError } = await supabase.from("credit_purchases").insert({
    user_id: parsed.userId,
    pack_key: pack.key,
    credits: pack.credits,
    amount_total: amountTotal,
    currency,
    stripe_session_id: session.id,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      console.warn("[webhook stripe] Session déjà créditée, ignorée :", session.id);
      return { status: "ignored", reason: "session déjà créditée" };
    }
    console.error("[webhook stripe] Échec insertion credit_purchases :", insertError);
    throw new Error("insertion credit_purchases échouée");
  }

  // Credit atomique cote SQL (credits = credits + p_amount).
  const { error: creditError } = await supabase.rpc("add_credits", {
    p_user_id: parsed.userId,
    p_amount: pack.credits,
  });

  if (creditError) {
    console.error("[webhook stripe] Échec add_credits :", creditError);
    // Annule la trace d'achat pour qu'un nouvel essai de Stripe puisse
    // reprendre proprement (sinon la contrainte unique le bloquerait).
    const { error: rollbackError } = await supabase
      .from("credit_purchases")
      .delete()
      .eq("stripe_session_id", session.id);
    if (rollbackError) {
      console.error("[webhook stripe] Annulation de credit_purchases impossible :", rollbackError);
    }
    throw new Error("add_credits échouée");
  }

  // Enregistre le client Stripe (portail de facturation) -- best-effort :
  // une erreur ici ne doit jamais faire echouer le webhook (credits deja
  // attribues).
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (customerId) {
    const { error: customerUpdateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", parsed.userId);

    if (customerUpdateError) {
      console.error(
        "[webhook stripe] Échec enregistrement stripe_customer_id (non bloquant) — migration_stripe_customer.sql exécutée ? :",
        customerUpdateError
      );
    }
  }

  return { status: "credited" };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(
      "[webhook stripe] STRIPE_WEBHOOK_SECRET manquante — à définir sur Vercel (Environment Variables) puis redéployer."
    );
    return NextResponse.json({ error: "webhook non configuré" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "signature manquante" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(
      "[webhook stripe] Signature invalide (STRIPE_WEBHOOK_SECRET correspond-elle au endpoint Stripe, en mode live ou test ?) :",
      err
    );
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }

  // Client admin (service_role) : sans SUPABASE_SERVICE_ROLE_KEY, la creation
  // du client leve une exception -- avant, elle faisait planter la route en
  // HTTP 500 sans message exploitable.
  let supabase: AdminClient;
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
    }
    supabase = createAdminClient();
  } catch (err) {
    console.error(
      "[webhook stripe] Client Supabase admin indisponible — vérifie SUPABASE_SERVICE_ROLE_KEY sur Vercel :",
      err
    );
    return NextResponse.json({ error: "configuration serveur incomplète" }, { status: 500 });
  }

  // Premier filet d'idempotence : un event.id deja vu n'est jamais retraite
  // (Stripe peut renvoyer le meme evenement plusieurs fois).
  const { error: eventInsertError } = await supabase
    .from("stripe_webhook_events")
    .insert({ id: event.id, type: event.type });

  if (eventInsertError) {
    if (eventInsertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[webhook stripe] Échec enregistrement de l'événement :", eventInsertError);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Un paiement differe (ex. virement SEPA) declenche ce meme evenement
        // avec payment_status "unpaid" : on ne credite que sur un paiement
        // effectivement confirme.
        if (session.payment_status === "paid") {
          const outcome = await handleCheckoutCompleted(session, supabase);
          if (outcome.status === "ignored") {
            return NextResponse.json({ received: true, ignored: outcome.reason });
          }
        }
        break;
      }
      default:
        // Types d'evenements non geres : ignores volontairement.
        break;
    }
  } catch (err) {
    console.error("[webhook stripe] Échec du traitement :", event.type, err);
    // Libere l'evenement pour que le nouvel essai de Stripe (500 => retry) soit
    // retraite : sinon la ligne deja inseree le ferait passer pour un doublon
    // et le credit serait perdu.
    const { error: releaseError } = await supabase
      .from("stripe_webhook_events")
      .delete()
      .eq("id", event.id);
    if (releaseError) {
      console.error("[webhook stripe] Libération de l'événement impossible :", releaseError);
    }
    return NextResponse.json({ error: "erreur de traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
