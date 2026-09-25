import { createBrowserClient } from "@supabase/ssr";

import {
  REMEMBER_ME_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  parseRememberMe,
} from "@/lib/supabase/session";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Leve une erreur explicite (au lieu du "supabaseUrl is required." interne
 * a @supabase/supabase-js) si les variables sont absentes -- ex. build
 * Vercel sans les variables configurees pour cet environnement, ou
 * variables ajoutees sans redeploiement depuis (NEXT_PUBLIC_* est inline
 * au build, pas lu a l'execution). Les appelants rendus sans interaction
 * utilisateur (ex. lib/hooks/use-supabase-user.ts, monte sur la Landing
 * Page publique) DOIVENT entourer leur appel d'un try/catch : sans ca,
 * cette erreur ferait planter toute la page ("client-side exception"),
 * pas seulement l'authentification.
 */
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Configuration Supabase manquante (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Vérifie les variables d'environnement Vercel pour cet environnement, et qu'un nouveau déploiement a eu lieu après leur ajout."
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
    // Rafraichissements de jeton faits dans le navigateur : meme politique
    // que le serveur (1 jour, ou cookie de session si "se souvenir" decoche).
    cookieOptions: { maxAge: readRememberMe() ? SESSION_MAX_AGE_SECONDS : undefined },
  });
}

function readRememberMe(): boolean {
  if (typeof document === "undefined") return true;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${REMEMBER_ME_COOKIE}=`));
  return parseRememberMe(match?.split("=")[1]);
}
