import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Rafraîchit la session si besoin -- ne pas retirer cet appel.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtectedPath(request.nextUrl.pathname)) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] Echec du rafraichissement de session Supabase :", error);
    return response;
  }
}
