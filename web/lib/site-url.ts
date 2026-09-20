const DEFAULT_SITE_URL = "https://margemax.com";

/**
 * URL publique du site pour les redirections Supabase (emailRedirectTo,
 * redirectTo) et le retour du portail Stripe. Priorite a
 * NEXT_PUBLIC_SITE_URL (environnements de test/preview), sinon le domaine
 * de production -- jamais une URL vercel.app codee en dur, ni une chaine
 * vide qui produirait un lien relatif invalide dans un e-mail.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base = configured && /^https?:\/\//.test(configured) ? configured : DEFAULT_SITE_URL;
  return base.replace(/\/+$/, "");
}
