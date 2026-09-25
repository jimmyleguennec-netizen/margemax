import { NextResponse } from "next/server";

import {
  AliExpressSearchError,
  performAliExpressSearch,
} from "@/lib/aliexpress-search";
import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Route Node.js (pas Edge) : le module partage utilise fetch + parsing
// HTML, sans dependance Edge-incompatible, mais alignee sur le runtime
// de app/api/analyze pour rester coherente.
export const runtime = "nodejs";
// Jamais mis en cache -- chaque recherche doit refleter le prix reel au
// moment de l'appel.
export const dynamic = "force-dynamic";
// Une recherche par mot-cle peut enchainer 2 appels Firecrawl (recherche
// + fiche produit) a 25 s chacun (voir FIRECRAWL_TIMEOUT_MS dans
// lib/aliexpress-search.ts) -- sans ceci, Vercel tue la fonction par
// defaut avant meme que notre propre delai interne se declenche, et le
// client recoit une erreur de timeout brute au lieu d'un message clair.
export const maxDuration = 60;

/**
 * Recherche libre, non authentifiee, non credite -- utilisee par la
 * demo publique de la landing page uniquement. Le parcours reel du
 * Dashboard (authentifie, avec debit de credit) passe par
 * app/api/analyze, pas par cette route.
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

  // Limite par IP (route publique, chaque appel coute des scrapes Firecrawl).
  const allowed = await checkRateLimit(`search:ip:${getClientIp()}`, RATE_LIMITS.searchByIp);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de recherches depuis ton adresse. Réessaie dans quelques minutes, ou crée un compte gratuit." },
      { status: 429 }
    );
  }

  try {
    const result = await performAliExpressSearch(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/search] Échec de l'extraction :", error);
    const status = error instanceof AliExpressSearchError ? error.status : 502;
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue pendant la recherche.",
      },
      { status }
    );
  }
}
