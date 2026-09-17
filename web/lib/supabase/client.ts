import { createBrowserClient } from "@supabase/ssr";

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
      "Configuration Supabase manquante (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Vérifiez les variables d'environnement Vercel pour cet environnement, et qu'un nouveau déploiement a eu lieu après leur ajout."
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
