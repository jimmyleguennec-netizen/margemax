import Stripe from "stripe";

/**
 * Client Stripe -- serveur uniquement (jamais importe depuis un composant
 * client). Instancie a l'appel plutot qu'au chargement du module pour
 * que l'absence de STRIPE_SECRET_KEY ne fasse pas planter tout import de
 * ce fichier, seulement les routes qui l'appellent reellement.
 */
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY manquante -- impossible d'initialiser le client Stripe."
    );
  }
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}
