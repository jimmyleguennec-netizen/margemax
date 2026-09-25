import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { createClient, setRememberMeCookie } from "@/lib/supabase/server";

/**
 * N'autorise qu'un chemin relatif interne au site (commence par un seul
 * "/", jamais par "//" qui serait interprete par le navigateur comme une
 * URL protocol-relative vers un autre domaine). Empeche toute
 * redirection externe arbitraire via le parametre `next`.
 */
function sanitizeNextPath(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

/**
 * Supabase n'expose pas de flag "compte cree a l'instant" -- on
 * l'approxime en comparant created_at (date de creation du compte) et
 * last_sign_in_at (date de CETTE connexion). Pour un compte tout juste
 * cree par cet appel OAuth, les deux sont a quelques millisecondes
 * d'ecart. Pour un compte preexistant qui se reconnecte, created_at
 * remonte a bien avant -- l'ecart est net. Tolerance large (10s) pour
 * absorber la latence reseau de l'echange de code.
 */
function looksJustCreated(user: User): boolean {
  if (!user.created_at || !user.last_sign_in_at) return false;
  const createdAt = new Date(user.created_at).getTime();
  const lastSignInAt = new Date(user.last_sign_in_at).getTime();
  return Math.abs(lastSignInAt - createdAt) < 10_000;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const intent = searchParams.get("intent");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Connexion (pas inscription) via Google : refuse la creation
      // implicite d'un compte. Si ce compte vient d'etre cree par cet
      // appel precis, aucun compte MargeMax n'existait avant -- on
      // annule la session et on renvoie vers /login avec un message
      // clair plutot que de laisser entrer dans le dashboard.
      if (intent === "login" && data.user && looksJustCreated(data.user)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=account_not_found`);
      }

      // OAuth / lien e-mail : pas de case a cocher -> session "souvenue" (1 jour).
      setRememberMeCookie(true);
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] Echec de l'echange du code OAuth :", error);
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation`);
}
