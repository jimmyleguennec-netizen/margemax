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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const parsed = parseClientReferenceId(session.client_reference_id);
  if (!parsed) {
    console.error(
      "[stripe webhook] client_reference_id absent ou mal forme, session",
      session.id
    );
    return;
  }

  const pack = PACKS.find((p) => p.key === parsed.packKey);
  if (!pack) {
    console.error(
      "[stripe webhook] pack inconnu:",
      parsed.packKey,
      "session",
      session.id
    );
    return;
  }

  // Le montant reellement encaisse est lu depuis la session Stripe (source
  // de verite), jamais depuis un calcul client.
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "eur";

  // FAILLE CORRIGEE : client_reference_id (donc `parsed.packKey` ci-dessus)
  // est construit cote client (lib/stripe-links.ts) et transite par l'URL
  // du Payment Link -- un attaquant peut ouvrir le Payment Link du pack le
  // MOINS CHER puis modifier manuellement ?client_reference_id=ultimate:...
  // dans la barre d'adresse avant de payer. Stripe ne valide jamais la
  // coherence entre client_reference_id et le prix reel du Payment Link
  // utilise : sans ce controle, le webhook aurait credite le nombre de
  // credits du pack DECLARE, quel que soit le montant REELLEMENT encaisse.
  // Tolerance minime pour d'eventuels ecarts d'arrondi Stripe legitimes --
  // jamais pour couvrir un ecart pack-a-pack, qui doit toujours rejeter.
  const expectedAmountCents = Math.round(pack.priceEuros * 100);
  const AMOUNT_TOLERANCE_CENTS = 2;
  if (Math.abs(amountTotal - expectedAmountCents) > AMOUNT_TOLERANCE_CENTS) {
    console.error(
      "[stripe webhook] montant encaissé incohérent avec le pack déclaré -- crédit BLOQUÉ (URL de Payment Link modifiée ou tentative de fraude) :",
      {
        session: session.id,
        packKey: pack.key,
        expectedAmountCents,
        amountTotalCents: amountTotal,
      }
    );
    return;
  }

  const supabase = createAdminClient();

  // Deuxieme filet d'idempotence : la contrainte unique sur
  // stripe_session_id refuse un doublon meme si stripe_webhook_events
  // avait deja laisse passer cet evenement pour une raison quelconque.
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
      // Contrainte unique violee = session deja traitee -- pas une erreur.
      console.warn(
        "[stripe webhook] session deja creditee, ignorée:",
        session.id
      );
      return;
    }
    console.error("[stripe webhook] echec insertion credit_purchases:", insertError);
    throw new Error("insertion credit_purchases echouee");
  }

  const { error: creditError } = await supabase.rpc("add_credits", {
    p_user_id: parsed.userId,
    p_amount: pack.credits,
  });

  if (creditError) {
    console.error("[stripe webhook] echec add_credits:", creditError);
    throw new Error("add_credits echouee");
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET manquante.");
    return NextResponse.json({ error: "webhook non configuré" }, { status: 500 });
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
    console.error("[stripe webhook] signature invalide:", err);
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Premier filet d'idempotence : un event.id Stripe deja vu n'est
  // jamais retraite (Stripe peut renvoyer le meme evenement plusieurs
  // fois en cas de reponse lente ou d'echec reseau precedent).
  const { error: eventInsertError } = await supabase
    .from("stripe_webhook_events")
    .insert({ id: event.id, type: event.type });

  if (eventInsertError) {
    if (eventInsertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe webhook] echec enregistrement event:", eventInsertError);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Un paiement differe (ex. virement SEPA) declenche ce meme
        // evenement avec payment_status "unpaid" -- on ne credite que
        // sur un paiement effectivement confirme.
        if (session.payment_status === "paid") {
          await handleCheckoutCompleted(session);
        }
        break;
      }
      default:
        // Types d'evenements non geres (ex. payment_intent.*) : ignores
        // volontairement, pas une erreur.
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] echec traitement:", event.type, err);
    // 500 => Stripe reessaiera cet evenement plus tard.
    return NextResponse.json({ error: "erreur de traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
