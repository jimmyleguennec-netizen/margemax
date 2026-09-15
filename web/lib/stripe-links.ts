// Payment Links Stripe des packs de credits -- publics par nature (concus
// pour etre partages avec les clients), donc lus via des variables
// NEXT_PUBLIC_ resolues cote client par pricing.tsx et credit-calculator.tsx.
const STRIPE_LINKS: Record<string, string | undefined> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_LINK_STARTER,
  essentiel: process.env.NEXT_PUBLIC_STRIPE_LINK_ESSENTIEL,
  avance: process.env.NEXT_PUBLIC_STRIPE_LINK_AVANCE,
  pro: process.env.NEXT_PUBLIC_STRIPE_LINK_PRO,
  ultimate: process.env.NEXT_PUBLIC_STRIPE_LINK_ULTIMATE,
};

/**
 * URL de destination du bouton "Choisir ce pack" : le Payment Link Stripe
 * reel du pack (avec client_reference_id pour tracer quel pack a ete
 * achete) si la variable d'environnement correspondante est configuree,
 * sinon un repli vers /login?pack=<cle> (aucun paiement direct possible
 * sans lien Stripe configure).
 */
export function buildPackCheckoutHref(packKey: string): string {
  const base = STRIPE_LINKS[packKey];
  if (!base) {
    return `/login?pack=${encodeURIComponent(packKey)}`;
  }

  try {
    const url = new URL(base);
    url.searchParams.set("client_reference_id", packKey);
    return url.toString();
  } catch {
    return base;
  }
}
