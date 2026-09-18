import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/server";

type RateLimitConfig = {
  maxAttempts: number;
  windowSeconds: number;
  lockSeconds: number;
};

/**
 * Presets partages entre login/signup/reset mdp -- toute limite doit
 * passer ici plutot que d'etre recopiee a la main a chaque appel.
 * Cle en deux niveaux (IP + e-mail) : la limite IP arrete un bruteforce
 * distribue sur beaucoup de comptes depuis une seule source, la limite
 * e-mail arrete un bruteforce cible sur un seul compte depuis plusieurs
 * IP (ou un VPN qui change d'adresse).
 */
export const RATE_LIMITS = {
  loginByIp: { maxAttempts: 20, windowSeconds: 900, lockSeconds: 900 },
  loginByEmail: { maxAttempts: 8, windowSeconds: 900, lockSeconds: 900 },
  signupByIp: { maxAttempts: 10, windowSeconds: 900, lockSeconds: 900 },
  signupByEmail: { maxAttempts: 5, windowSeconds: 900, lockSeconds: 900 },
  passwordResetByIp: { maxAttempts: 10, windowSeconds: 900, lockSeconds: 900 },
  passwordResetByEmail: { maxAttempts: 5, windowSeconds: 900, lockSeconds: 900 },
  // Formulaire de contact (app/api/contact/route.ts) : cle par IP
  // uniquement (pas d'e-mail authentifie a ce stade), evite qu'un envoi
  // automatise n'epuise le quota Resend ou n'inonde contact@autoutilshop.fr.
  contactByIp: { maxAttempts: 5, windowSeconds: 3600, lockSeconds: 3600 },
} as const satisfies Record<string, RateLimitConfig>;

export const RATE_LIMIT_MESSAGE =
  "Trop de tentatives. Merci de réessayer dans quelques minutes.";

/**
 * Verifie ET enregistre atomiquement une tentative (fonction Postgres
 * register_auth_attempt, voir migration_auth_rate_limit.sql) -- fiable en
 * environnement serverless (Vercel) ou aucune memoire de process n'est
 * partagee entre invocations, contrairement a un compteur en memoire.
 *
 * Fail-open deliberement : si la verification elle-meme echoue (table pas
 * encore migree, Supabase indisponible...), on laisse la tentative passer
 * plutot que de bloquer TOUTE connexion/inscription a cause d'une panne
 * sur un mecanisme annexe de defense en profondeur.
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("register_auth_attempt", {
      p_key: key,
      p_max_attempts: config.maxAttempts,
      p_window_seconds: config.windowSeconds,
      p_lock_seconds: config.lockSeconds,
    });

    if (error) {
      console.error("[rate-limit] register_auth_attempt a échoué :", error);
      return true;
    }

    return data === true;
  } catch (err) {
    console.error("[rate-limit] Exception pendant la vérification :", err);
    return true;
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("reset_auth_attempts", { p_key: key });
  } catch (err) {
    console.error("[rate-limit] Échec de la réinitialisation :", err);
  }
}

/**
 * IP du client depuis les en-têtes de la requête (Vercel renseigne
 * x-forwarded-for en tête de proxy). "unknown" en repli plutôt qu'une
 * exception : mieux vaut regrouper les requêtes sans IP identifiable sous
 * une même clé que de faire planter l'action d'authentification.
 */
export function getClientIp(): string {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
