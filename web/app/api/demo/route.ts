import { NextResponse } from "next/server";

import {
  AliExpressSearchError,
  performAliExpressSearch,
  type AliExpressSearchResult,
} from "@/lib/aliexpress-search";
import { DEMO_PRODUCT_URL, DEMO_REFRESH_SECONDS } from "@/lib/demo-product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Exemple en direct du Dashboard : analyse REELLE de DEMO_PRODUCT_URL,
 * mise en cache (memoire de l'instance + cache CDN via Cache-Control) et
 * rafraichie au plus toutes les DEMO_REFRESH_SECONDS -- donc au plus quelques
 * scrapes Firecrawl par jour quel que soit le trafic. Publique, sans credit.
 * Jamais de chiffres de secours inventes : si le scrape echoue et qu'aucun
 * resultat en cache n'existe, la route renvoie 503.
 */
const FAILURE_RETRY_MS = 60_000;

let cached: { at: number; result: AliExpressSearchResult } | null = null;
let lastFailureAt = 0;
let inFlight: Promise<AliExpressSearchResult> | null = null;

function isFresh(entry: { at: number }): boolean {
  return Date.now() - entry.at < DEMO_REFRESH_SECONDS * 1000;
}

function respond(entry: { at: number; result: AliExpressSearchResult }, stale = false) {
  return NextResponse.json(
    {
      ...entry.result,
      fetchedAt: new Date(entry.at).toISOString(),
      refreshEveryHours: DEMO_REFRESH_SECONDS / 3600,
      stale,
    },
    {
      headers: {
        "Cache-Control": stale
          ? "no-store"
          : `public, s-maxage=${DEMO_REFRESH_SECONDS}, stale-while-revalidate=86400`,
      },
    }
  );
}

export async function GET() {
  if (cached && isFresh(cached)) return respond(cached);

  // Echec recent : ne pas relancer un scrape (payant) a chaque requete.
  if (Date.now() - lastFailureAt < FAILURE_RETRY_MS) {
    if (cached) return respond(cached, true);
    return NextResponse.json({ error: "Exemple indisponible pour le moment." }, { status: 503 });
  }

  try {
    // Une seule analyse a la fois, meme sous requetes concurrentes.
    inFlight ??= performAliExpressSearch(DEMO_PRODUCT_URL).finally(() => {
      inFlight = null;
    });
    const result = await inFlight;
    cached = { at: Date.now(), result };
    return respond(cached);
  } catch (error) {
    lastFailureAt = Date.now();
    console.error(
      "[api/demo] Échec du rafraîchissement de l'exemple en direct :",
      error instanceof AliExpressSearchError ? `${error.status} ${error.message}` : error
    );
    // Resultat perime plutot qu'aucun resultat -- signale par stale: true.
    if (cached) return respond(cached, true);
    return NextResponse.json({ error: "Exemple indisponible pour le moment." }, { status: 503 });
  }
}
