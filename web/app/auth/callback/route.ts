import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] Echec de l'echange du code OAuth :", error);
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation`);
}
