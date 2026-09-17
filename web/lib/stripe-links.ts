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
 * URL de destination du bouton "Choisir ce pack".
 *
 * Sans `userId` connu (visiteur non connecte), impossible de lier un
 * paiement a un compte -- on force systematiquement /login?pack=<cle>
 * AVANT tout lien Stripe, meme si le Payment Link du pack est configure.
 * NeonAuthPanel reprend ce parcours apres connexion/inscription reussie
 * en rappelant cette fonction avec l'utilisateur desormais connu.
 *
 * Avec un `userId`, encode <packKey>:<userId> dans client_reference_id
 * (seul champ disponible sur un Payment Link statique) : le webhook
 * Stripe separe les deux pour savoir QUOI crediter et A QUI.
 */
export function buildPackCheckoutHref(packKey: string, userId?: string): string {
  const base = STRIPE_LINKS[packKey];
  if (!base || !userId) {
    return `/login?pack=${encodeURIComponent(packKey)}`;
  }

  try {
    const url = new URL(base);
    url.searchParams.set("client_reference_id", `${packKey}:${userId}`);
    return url.toString();
  } catch {
    return base;
  }
}
