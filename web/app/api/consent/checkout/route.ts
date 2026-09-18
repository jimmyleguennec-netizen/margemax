import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PACKS } from "@/lib/packs";
import { CGV_CONSENT_VERSION } from "@/lib/legal-consent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Enregistre la preuve de consentement "execution immediate + renonciation
 * au droit de retractation" (art. L.221-28) AVANT toute redirection vers un
 * Payment Link Stripe. cgv_version n'est jamais lue depuis le corps de la
 * requete : elle vient uniquement de la constante serveur, pour qu'un
 * client ne puisse pas falsifier la version du texte accepte.
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
  if (!packKey || !PACKS.some((pack) => pack.key === packKey)) {
    return NextResponse.json(
      { error: "Pack de crédits inconnu." },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connectez-vous pour finaliser cet achat." },
      { status: 401 }
    );
  }

  const { error: insertError } = await supabase.from("checkout_consents").insert({
    user_id: user.id,
    pack_key: packKey,
    cgv_version: CGV_CONSENT_VERSION,
  });

  if (insertError) {
    console.error("[api/consent/checkout] Échec d'enregistrement du consentement :", insertError);
    return NextResponse.json(
      { error: "Impossible d'enregistrer votre consentement pour le moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
