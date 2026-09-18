// Payment Links Stripe des packs de credits -- publics par nature (concus
// pour etre partages avec les clients), donc lus via des variables
// NEXT_PUBLIC_ resolues cote client par pricing.tsx et credit-calculator.tsx.
// Ces memes variables restent lisibles cote serveur (le prefixe NEXT_PUBLIC_
// controle seulement leur inlining supplementaire dans le bundle client,
// pas leur portee) -- reutilisees telles quelles par buildStripeCheckoutUrl
// ci-dessous, appelee depuis app/api/checkout/route.ts.
const STRIPE_LINKS: Record<string, string | undefined> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_LINK_STARTER,
  essentiel: process.env.NEXT_PUBLIC_STRIPE_LINK_ESSENTIEL,
  avance: process.env.NEXT_PUBLIC_STRIPE_LINK_AVANCE,
  pro: process.env.NEXT_PUBLIC_STRIPE_LINK_PRO,
  ultimate: process.env.NEXT_PUBLIC_STRIPE_LINK_ULTIMATE,
};

/**
 * URL Stripe reelle pour un pack + utilisateur connu, ou `null` si le
 * Payment Link n'est pas configure pour ce pack (variable d'env absente en
 * production, ou URL invalide). Source unique pour la resolution
 * pack+utilisateur -> URL Stripe, utilisee cote serveur (seule source
 * autorisee a decider si un paiement peut demarrer, voir
 * app/api/checkout/route.ts) et par buildPackCheckoutHref ci-dessous.
 *
 * Encode <packKey>:<userId> dans client_reference_id (seul champ
 * disponible sur un Payment Link statique) : le webhook Stripe separe les
 * deux pour savoir QUOI crediter et A QUI.
 */
export function buildStripeCheckoutUrl(packKey: string, userId: string): string | null {
  const base = STRIPE_LINKS[packKey];
  if (!base) return null;

  try {
    const url = new URL(base);
    url.searchParams.set("client_reference_id", `${packKey}:${userId}`);
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * URL de destination du bouton "Choisir ce pack" pour un visiteur dont on
 * ne connait pas encore l'identite (Landing Page, avant connexion).
 *
 * Sans `userId` connu, impossible de lier un paiement a un compte -- on
 * renvoie systematiquement vers /signup?pack=<cle> (plutot que /login :
 * un visiteur qui clique "Choisir ce pack" depuis la Landing n'a le plus
 * souvent pas encore de compte MargeMax ; le panneau d'inscription propose
 * de toute facon un lien vers la connexion pour qui en a deja un).
 * NeonAuthPanel reprend ce parcours apres connexion/inscription reussie.
 *
 * Une fois l'utilisateur connu, la redirection Stripe reelle passe par
 * `/api/checkout` (voir CheckoutConsentDialog), jamais par cette fonction
 * -- elle ne sert plus qu'a construire le `href` initial du bouton, qui
 * n'est de toute facon jamais suivi une fois `onIntercept` branche.
 */
export function buildPackCheckoutHref(packKey: string, userId?: string): string {
  if (!userId) {
    return `/signup?pack=${encodeURIComponent(packKey)}`;
  }

  return buildStripeCheckoutUrl(packKey, userId) ?? `/signup?pack=${encodeURIComponent(packKey)}`;
}
