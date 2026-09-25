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
  email?: string | null,
  /** Price ID Stripe verifie (voir isPriceIdUsable) -- sinon price_data. */
  priceId?: string | null
): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    locale: "fr",
    client_reference_id: `${pack.key}:${userId}`,
    ...(email ? { customer_email: email } : {}),
    customer_creation: "always",
    // Recu par e-mail : en mode live, un `receipt_email` explicite declenche
    // l'envoi du recu Stripe au client meme si l'option n'est pas activee dans
    // le tableau de bord (Parametres -> E-mails clients).
    payment_intent_data: {
      description: `Pack ${pack.label} — ${pack.credits} crédits MargeMax`,
      ...(email ? { receipt_email: email } : {}),
    },
    // Facture (PDF) creee pour chaque achat : c'est elle qui apparait dans le
    // portail client Stripe ("Gerer mes factures"). Sans ceci, un paiement
    // unique ne genere aucune facture et l'historique reste vide.
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: `Pack ${pack.label} — ${pack.credits} crédits MargeMax`,
        footer: "AutOutilShop SAS — SIREN 107 057 432 — TVA intracommunautaire FR70107057432",
      },
    },
    line_items: [
      priceId
        ? { quantity: 1, price: priceId }
        : {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: packAmountCents(pack),
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

export function packAmountCents(pack: Pack): number {
  return Math.round(pack.priceEuros * 100);
}

/** Variable d'environnement optionnelle portant le Price ID Stripe d'un
 * pack : STRIPE_PRICE_ID_STARTER, _ESSENTIEL, _AVANCE, _PRO, _ULTIMATE
 * (cle du pack en majuscules, sans accent). */
export function priceIdEnvName(pack: Pack): string {
  return `STRIPE_PRICE_ID_${pack.key.toUpperCase()}`;
}

export function getConfiguredPriceId(pack: Pack): string | null {
  const raw = process.env[priceIdEnvName(pack)]?.trim();
  return raw && raw.startsWith("price_") ? raw : null;
}

/**
 * Un Price ID n'est utilise que s'il correspond EXACTEMENT au pack : actif,
 * paiement unique (non recurrent), en euros, au meme montant que PACKS.
 * Le webhook recoupe amount_total avec PACKS avant de crediter -- un Price
 * ID perime ou mal associe ferait payer le client sans le crediter, donc
 * on prefere retomber sur price_data (prix issu de PACKS).
 */
export function isPriceIdUsable(
  price: { active: boolean; currency: string; unit_amount: number | null; type: string },
  pack: Pack
): boolean {
  return (
    price.active &&
    price.type === "one_time" &&
    price.currency === "eur" &&
    price.unit_amount === packAmountCents(pack)
  );
}
