/**
 * Duree de vie des cookies de session Supabase.
 *
 * - "Se souvenir de moi" coche : 1 jour (86 400 s). Le middleware re-emet les
 *   cookies a chaque rafraichissement du jeton, ce qui donne une expiration
 *   apres 1 jour d'INACTIVITE (et non une session quasi infinie : @supabase/ssr
 *   applique sinon 400 jours par defaut).
 * - Decoche : cookies de session navigateur (sans maxAge/expires), effaces a la
 *   fermeture du navigateur.
 *
 * Le choix est memorise dans le cookie auxiliaire `remember_me` ("true" |
 * "false") pour que le middleware et le client navigateur le respectent lors
 * des rafraichissements de jeton.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export const REMEMBER_ME_COOKIE = "remember_me";

/** Absent ou illisible => true (comptes OAuth, sessions anterieures). */
export function parseRememberMe(value: string | undefined | null): boolean {
  return value !== "false";
}

type LifetimeOptions = { maxAge?: number; expires?: Date };

/**
 * Applique la politique de duree de vie a des options de cookie. Les cookies
 * de SUPPRESSION (maxAge <= 0, poses par signOut) sont laisses intacts :
 * leur retirer maxAge les transformerait en cookies de session et
 * l'utilisateur ne serait jamais reellement deconnecte.
 */
export function applySessionLifetime<T extends LifetimeOptions>(
  options: T | undefined,
  rememberMe: boolean
): T {
  const base = (options ?? {}) as T;
  if (typeof base.maxAge === "number" && base.maxAge <= 0) return base;
  if (!rememberMe) return { ...base, maxAge: undefined, expires: undefined };
  return {
    ...base,
    maxAge: Math.min(base.maxAge ?? SESSION_MAX_AGE_SECONDS, SESSION_MAX_AGE_SECONDS),
    expires: undefined,
  };
}
