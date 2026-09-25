import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { computeMarginEstimate } from "@/lib/margin-estimate";
import {
  AliExpressSearchError,
  performAliExpressSearch,
} from "@/lib/aliexpress-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Voir app/api/search/route.ts : meme budget, memes appels Firecrawl
// potentiellement enchaines cote lib/aliexpress-search.ts.
export const maxDuration = 60;

/**
 * Parcours reel du Dashboard : authentifie, 1 credit debite par analyse
 * REUSSIE uniquement.
 *
 * Ordre des operations, dans cet ordre precis pour respecter "aucun
 * debit si l'analyse echoue" sans pour autant lancer un scrape (couteux,
 * facture par Firecrawl) pour un utilisateur a 0 credit :
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
  let body: { query?: string; compare?: boolean };
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
      { error: "Connecte-toi pour lancer une analyse." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("[api-analyse] Profil introuvable pour l'utilisateur", user.id, profileError);
    return NextResponse.json(
      { error: "Impossible de vérifier ton solde de crédits pour le moment." },
      { status: 502 }
    );
  }

  if (profile.credits <= 0) {
    return NextResponse.json(
      {
        error:
          "Solde de crédits insuffisant. Achète un pack pour continuer à analyser des produits.",
        credits: profile.credits,
      },
      { status: 402 }
    );
  }

  let result;
  try {
    result = await performAliExpressSearch(query, {
      // false pour une actualisation de prix depuis l'historique : on veut le
      // prix du MEME produit, pas un fournisseur alternatif.
      compareSuppliers: body.compare !== false,
    });
  } catch (error) {
    console.error("[api-analyse] Échec de l'analyse (aucun crédit débité) :", error);
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

  // Debit atomique d'1 credit pour TOUTE analyse reussie, y compris un
  // resultat partiel ("partiellement verifie") : l'analyse a un cout reel
  // cote fournisseur (Firecrawl) quel que soit son degre de completude.
  // Aucun chemin ne renvoie un resultat sans debit : si le debit echoue
  // (panne DB) ou si le solde est tombe a 0 entre-temps (requete
  // concurrente), le resultat n'est PAS livre et rien n'est enregistre
  // dans l'historique.
  const { data: newBalance, error: consumeError } = await supabase.rpc(
    "consume_credit",
    { p_user_id: user.id }
  );

  if (consumeError) {
    console.error(
      "[api-analyse] Échec du débit de crédit (fonction SQL consume_credit) :",
      consumeError.code,
      consumeError.message,
      consumeError.details,
      consumeError.hint
    );
    return NextResponse.json(
      {
        error:
          "Impossible de finaliser l'analyse pour le moment. Réessaie dans quelques instants.",
        creditsDebited: false,
      },
      { status: 502 }
    );
  }

  if (newBalance === null) {
    return NextResponse.json(
      {
        error:
          "Solde de crédits insuffisant. Achète un pack pour continuer à analyser des produits.",
        credits: 0,
        creditsDebited: false,
      },
      { status: 402 }
    );
  }

  // Persistance best-effort de l'historique lié au compte (colonnes
  // ajoutées par migration_search_history_details.sql à la table
  // public.search_history déjà existante). Ne doit JAMAIS faire échouer
  // la reponse : si la migration n'a pas encore été exécutée (colonnes
  // absentes) ou toute autre panne, on logue et on continue -- l'analyse
  // elle-même a déjà réussi et coûté un crédit, elle ne doit pas être
  // perdue pour autant. Voir app/api/history/route.ts (lecture) et
  // components/dashboard/history-panel.tsx (dégradation visible côté UI
  // si la persistance n'est pas disponible).
  const baseRow = {
    user_id: user.id,
    query,
    result_count: 1,
    status: "succes",
    title: result.title,
    product_url: result.url,
    subtotal: result.subtotal,
    shipping: result.shipping,
    shipping_status: result.shippingStatus,
    import_fee: result.importFee,
    import_fee_status: result.importFeeStatus,
    variant_status: result.variantStatus,
    total: result.total,
    partial_total: result.partialTotal,
    is_complete: result.isComplete,
    currency: result.currency,
  };
  // Colonnes ajoutees par migration_search_history_v2.sql : image du produit
  // et donnees de marge (prix bas/conseille/haut + comparaison fournisseurs).
  const estimate = computeMarginEstimate(result.partialTotal, result.importFee);
  const richRow = {
    ...baseRow,
    image_url: result.product_image_url,
    margin_data: {
      recommendedPrice: estimate.recommendedPrice,
      lowPrice: estimate.lowPrice,
      highPrice: estimate.highPrice,
      marginLow: estimate.marginLow,
      marginHigh: estimate.marginHigh,
      supplierComparison: result.supplierComparison ?? null,
    },
  };

  let { error: historyError } = await supabase.from("search_history").insert(richRow);
  if (historyError?.code === "42703" || historyError?.code === "PGRST204") {
    // Migration v2 pas encore executee : on enregistre au moins les
    // colonnes de base plutot que de perdre toute l'entree.
    ({ error: historyError } = await supabase.from("search_history").insert(baseRow));
  }
  if (historyError) {
    console.error(
      "[api-analyse] Historique non enregistré (les migrations migration_search_history_details.sql et migration_search_history_v2.sql ont-elles été exécutées ?) :",
      historyError.code,
      historyError.message
    );
  }

  return NextResponse.json({
    ...result,
    creditsDebited: true,
    credits: newBalance,
  });
}
