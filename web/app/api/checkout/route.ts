import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PACKS } from "@/lib/packs";
import { buildStripeCheckoutUrl } from "@/lib/stripe-links";
import {
  buildCheckoutSessionParams,
  getConfiguredPriceId,
  isPriceIdUsable,
  priceIdEnvName,
} from "@/lib/stripe-checkout";
import { getStripeClient } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**

 * Cree une Checkout Session Stripe serveur (secours : Payment Link) pour <packKey> + utilisateur CONNECTE (session serveur, jamais un
 * user.id fourni par le client) en URL Stripe reelle.
 *
 * Avant ce endpoint, CheckoutConsentDialog construisait l'URL Stripe
 * cote client via buildPackCheckoutHref(packKey, userId) : si le Payment
 * Link d'un pack n'etait pas configure (variable NEXT_PUBLIC_STRIPE_LINK_*
 * absente en production), cette fonction repliait silencieusement sur
 * "/login?pack=...", renvoyant un utilisateur DEJA connecte vers /login --
 * qui le renvoyait aussitot vers /dashboard (redirection anti-double-login
 * existante), rouvrant la modale de consentement en boucle sans jamais
 * atteindre Stripe ni expliquer pourquoi. Ce endpoint remplace cette
 * resolution cote client : en cas de lien manquant, il renvoie une erreur
 * claire (502) plutot qu'un lien de secours vers /login.
 */
export async function POST(request: Request) {
  let body: { packKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide — JSON attendu ({ packKey: string })." },
      { status: 400 }
    );
  }

  const packKey = body.packKey;
  const pack = PACKS.find((p) => p.key === packKey);
  if (!pack) {
    return NextResponse.json({ error: "Pack de crédits inconnu." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connecte-toi pour finaliser cet achat." },
      { status: 401 }
    );
  }

  // 1) Voie principale : Checkout Session creee cote serveur avec
  //    STRIPE_SECRET_KEY -- prix issu de PACKS (source unique), aucune
  //    variable NEXT_PUBLIC_STRIPE_LINK_* requise.
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripeClient();

      // Price ID optionnel (STRIPE_PRICE_ID_<PACK>) : utilise seulement s'il
      // correspond exactement au pack (voir isPriceIdUsable) ; absent ou
      // incoherent -> price_data (prix issu de PACKS), le checkout s'ouvre
      // dans tous les cas.
      let priceId: string | null = getConfiguredPriceId(pack);
      if (priceId) {
        try {
          const price = await stripe.prices.retrieve(priceId);
          if (!isPriceIdUsable(price, pack)) {
            console.warn(
              `[api/checkout] ${priceIdEnvName(pack)} (${priceId}) ne correspond pas au pack "${pack.key}" (montant/devise/statut) -- repli sur price_data.`
            );
            priceId = null;
          }
        } catch (err) {
          console.warn(
            `[api/checkout] ${priceIdEnvName(pack)} (${priceId}) introuvable avec cette cle Stripe (mode test/live different ?) -- repli sur price_data :`,
            err instanceof Error ? err.message : err
          );
          priceId = null;
        }
      }

      const session = await stripe.checkout.sessions.create(
        buildCheckoutSessionParams(pack, user.id, getSiteUrl(), user.email, priceId)
      );
      if (session.url) {
        return NextResponse.json({ url: session.url });
      }
      console.error(`[api/checkout] Session Stripe ${session.id} creee sans URL.`);
    } catch (err) {
      console.error(
        `Checkout initiation failed: (pack "${pack.key}")`,
        err
      );
      // On tente quand meme le Payment Link ci-dessous s'il existe.
    }
  }

  // 2) Secours : Payment Link statique historique.
  const linkUrl = buildStripeCheckoutUrl(pack.key, user.id);
  if (linkUrl) {
    return NextResponse.json({ url: linkUrl });
  }

  console.error(
    `[api/checkout] Aucun moyen de paiement disponible pour "${pack.key}" : STRIPE_SECRET_KEY absente ou invalide ET NEXT_PUBLIC_STRIPE_LINK_${pack.key.toUpperCase()} absente. Verifie les variables d'environnement Vercel.`
  );
  return NextResponse.json(
    {
      error:
        "Le paiement est momentanément indisponible. Réessaie dans quelques instants — aucun montant n'a été débité.",
    },
    { status: 502 }
  );
}
