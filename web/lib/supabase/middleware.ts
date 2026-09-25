import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  REMEMBER_ME_COOKIE,
  applySessionLifetime,
  parseRememberMe,
} from "@/lib/supabase/session";

/**
 * Prefixes de route exigeant une session active. Verifie ici (middleware,
 * execute avant TOUT rendu, y compris pour un Server Component) en plus
 * du controle deja present dans app/dashboard/page.tsx -- defense en
 * profondeur : toute nouvelle route ajoutee sous l'un de ces prefixes est
 * protegee automatiquement, meme si son propre garde-fou est oublie.
 */
const PROTECTED_PREFIXES = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Variables Supabase absentes (ex. pas encore configurees sur Vercel) :
  // on laisse la page se charger normalement plutot que de planter tout
  // le site avec une MIDDLEWARE_INVOCATION_FAILED.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes -- session Supabase non rafraichie."
    );
    return response;
  }

  try {
    // Preference "Se souvenir de moi" posee a la connexion : preservee lors
    // des rafraichissements de jeton (cookies de session vs 1 jour).
    const rememberMe = parseRememberMe(request.cookies.get(REMEMBER_ME_COOKIE)?.value);
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: any }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, applySessionLifetime(options, rememberMe))
          );
        },
      },
    });

    // Rafraîchit la session si besoin -- ne pas retirer cet appel.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtectedPath(request.nextUrl.pathname)) {
      // Cookies d'auth presents mais session invalide/expiree : on les
      // purge et on signale l'expiration. Sans cookie (visiteur jamais
      // connecte), simple redirection vers /login, sans faux message.
      const authCookies = request.cookies
        .getAll()
        .filter(({ name }) => name.startsWith("sb-"));
      const loginUrl = new URL("/login", request.url);
      if (authCookies.length > 0) loginUrl.searchParams.set("expired", "true");
      const redirectResponse = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) => redirectResponse.cookies.set(cookie));
      authCookies.forEach(({ name }) =>
        redirectResponse.cookies.set(name, "", { path: "/", maxAge: 0 })
      );
      return redirectResponse;
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] Echec du rafraichissement de session Supabase :", error);
    return response;
  }
}
