import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * `rememberMe: false` (case "Se souvenir de moi" decochee) transforme les
 * cookies de session en cookies DE SESSION NAVIGATEUR (sans maxAge/expires) :
 * ils survivent tant que le navigateur reste ouvert, mais disparaissent a
 * sa fermeture complete -- contrairement a `sessionStorage`, qui n'existe
 * que cote navigateur et casserait toute lecture de session cote serveur
 * (Server Components, Server Actions, middleware) sur lesquels repose
 * cette architecture @supabase/ssr. On agit donc sur l'attribut du
 * cookie, pas sur son mecanisme de stockage.
 */
export function createClient(options?: { rememberMe?: boolean }) {
  const cookieStore = cookies();
  const rememberMe = options?.rememberMe ?? true;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              const finalOptions = rememberMe
                ? cookieOptions
                : { ...cookieOptions, maxAge: undefined, expires: undefined };
              cookieStore.set(name, value, finalOptions);
            });
          } catch {
            // setAll peut être appelé depuis un Server Component :
            // ignoré si un middleware rafraîchit déjà la session.
          }
        },
      },
    }
  );
}

/**
 * Client admin (service role) -- usage serveur uniquement (routes API /
 * server actions), jamais importé côté client. Réservé aux opérations
 * privilégiées (ex. crédit de crédits après paiement Stripe confirmé),
 * comme dans l'app Streamlit existante.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
