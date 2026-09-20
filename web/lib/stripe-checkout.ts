import type Stripe from "stripe";

import type { Pack } from "@/lib/packs";

/**
 * Parametres d'une Checkout Session Stripe pour un pack de credits.
 *
 * Contrat avec le webhook (app/api/webhooks/stripe/route.ts) :
 *  - client_reference_id = "<packKey>:<userId>" (meme format que les
 *    Payment Links historiques) ;
 *  - amount_total = prix du pack en centimes (le webhook recoupe ce montant
 *    avec PACKS avant de crediter) ;
 *  - customer_creation "always" pour que le webhook enregistre
 *    stripe_customer_id (portail de facturation).
 *
 * Le prix est defini ICI depuis PACKS (source unique) via price_data :
 * aucun Product/Price a creer dans le dashboard Stripe.
 */
export function buildCheckoutSessionParams(
  pack: Pack,
  userId: string,
  siteUrl: string,
  email?: string | null
): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    locale: "fr",
    client_reference_id: `${pack.key}:${userId}`,
    ...(email ? { customer_email: email } : {}),
    customer_creation: "always",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(pack.priceEuros * 100),
          product_data: {
            name: `Pack ${pack.label} — ${pack.credits} crédits MargeMax`,
          },
        },
      },
    ],
    success_url: `${siteUrl}/dashboard?tab=account&purchase=success`,
    cancel_url: `${siteUrl}/dashboard?tab=account&purchase=cancelled`,
  };
}
