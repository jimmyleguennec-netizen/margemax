/**
 * Duree de vie maximale des cookies de session Supabase : 7 jours. Le
 * middleware re-emet les cookies a chaque rafraichissement du jeton, ce qui
 * en fait une expiration apres 7 jours d'INACTIVITE (et non une session
 * infinie : @supabase/ssr applique sinon 400 jours par defaut).
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
