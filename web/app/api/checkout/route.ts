import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PACKS } from "@/lib/packs";
import { buildStripeCheckoutUrl } from "@/lib/stripe-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resout <packKey> + utilisateur CONNECTE (session serveur, jamais un
 * user.id fourni par le client) en URL Stripe reelle.
 *
 * Avant ce endpoint, CheckoutConsentDialog construisait l'URL Stripe
 * cote client via buildPackCheckoutHref(packKey, userId) : si le Payment
 * Link d'un pack n'etait pas configure (variable NEXT_PUBLIC_STRIPE_LINK_*
 * absente en production), cette fonction repliait silencieusement sur
 * "/login?pack=...", renvoyant un utilisateur DEJA connecte vers /login --
 * qui le renvoyait aussitot vers /dashboard (redirection anti-double-login
 * existante), rouvrant la modale de consentement en boucle sans jamais
 * atteindre Stripe ni expliquer pourquoi. Ce endpoint remplace cette
 * resolution cote client : en cas de lien manquant, il renvoie une erreur
 * claire (502) plutot qu'un lien de secours vers /login.
 */
export async function POST(request: Request) {
  let body: { packKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide — JSON attendu ({ packKey: string })." },
      { status: 400 }
    );
  }

  const packKey = body.packKey;
  const pack = PACKS.find((p) => p.key === packKey);
  if (!pack) {
    return NextResponse.json({ error: "Pack de crédits inconnu." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connecte-toi pour finaliser cet achat." },
      { status: 401 }
    );
  }

  const url = buildStripeCheckoutUrl(pack.key, user.id);
  if (!url) {
    console.error(
      `[api/checkout] Lien Stripe manquant ou invalide pour le pack "${pack.key}" (NEXT_PUBLIC_STRIPE_LINK_${pack.key.toUpperCase()} absente ou mal formee en production).`
    );
    return NextResponse.json(
      {
        error:
          "Ce pack n'est pas disponible à l'achat pour le moment. Contacte le support ou réessaie plus tard.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ url });
}
