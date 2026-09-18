import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  AliExpressSearchError,
  performAliExpressSearch,
} from "@/lib/aliexpress-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Voir app/api/search/route.ts : meme budget, memes appels ScraperAPI
// potentiellement enchaines cote lib/aliexpress-search.ts.
export const maxDuration = 60;

/**
 * Parcours reel du Dashboard : authentifie, 1 credit debite par analyse
 * REUSSIE uniquement.
 *
 * Ordre des operations, dans cet ordre precis pour respecter "aucun
 * debit si l'analyse echoue" sans pour autant lancer un scrape (couteux,
 * facture par ScraperAPI) pour un utilisateur a 0 credit :
 *   1. Verifie la session (401 si absente).
 *   2. Lit le solde actuel -- simple garde-fou pour eviter un scrape
 *      inutile, PAS la protection anti-concurrence (voir etape 4).
 *   3. Lance l'analyse reelle. Si elle echoue, on s'arrete la : aucun
 *      credit touche.
 *   4. Debite atomiquement 1 credit via la fonction SQL consume_credit
 *      (UPDATE ... WHERE credits > 0 dans une seule instruction) --
 *      c'est cette etape, pas la lecture de l'etape 2, qui garantit
 *      qu'aucune requete concurrente ne peut faire passer le solde sous
 *      zero.
 */
export async function POST(request: Request) {
  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide — JSON attendu ({ query: string })." },
      { status: 400 }
    );
  }

  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json(
      { error: "Le champ 'query' (mot-clé ou lien AliExpress) est requis." },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connectez-vous pour lancer une analyse." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("[api/analyze] profil introuvable pour", user.id, profileError);
    return NextResponse.json(
      { error: "Impossible de vérifier votre solde de crédits pour le moment." },
      { status: 502 }
    );
  }

  if (profile.credits <= 0) {
    return NextResponse.json(
      {
        error:
          "Solde de crédits insuffisant. Achetez un pack pour continuer à analyser des produits.",
        credits: profile.credits,
      },
      { status: 402 }
    );
  }

  let result;
  try {
    result = await performAliExpressSearch(query);
  } catch (error) {
    console.error("[api/analyze] Échec de l'analyse (aucun crédit débité) :", error);
    const status = error instanceof AliExpressSearchError ? error.status : 502;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur inconnue pendant l'analyse.",
        creditsDebited: false,
      },
      { status }
    );
  }

  const { data: newBalance, error: consumeError } = await supabase.rpc(
    "consume_credit",
    { p_user_id: user.id }
  );

  if (consumeError) {
    console.error("[api/analyze] Échec du débit de crédit :", consumeError);
    // L'analyse a reussi mais le debit a echoue techniquement (panne DB) --
    // on renvoie quand meme le resultat (deja paye a ScraperAPI) plutot que
    // de le jeter, en signalant clairement que le credit n'a pas ete
    // debite pour que le client ne prenne pas ca pour un solde a jour.
    return NextResponse.json({
      ...result,
      creditsDebited: false,
      credits: profile.credits,
    });
  }

  if (newBalance === null) {
    // Solde tombe a 0 entre la lecture (etape 2) et le debit atomique --
    // requete concurrente sur le meme compte. L'analyse a deja ete
    // effectuee (et facturee cote ScraperAPI) : on la renvoie quand meme,
    // mais sans decompter un credit inexistant.
    return NextResponse.json({
      ...result,
      creditsDebited: false,
      credits: 0,
    });
  }

  return NextResponse.json({
    ...result,
    creditsDebited: true,
    credits: newBalance,
  });
}
