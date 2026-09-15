import { NextResponse } from "next/server";
import { createHmac } from "crypto";

// Route Node.js (pas Edge) : necessaire pour le module crypto utilise par
// la signature HMAC de l'API officielle AliExpress (voir signTopRest
// plus bas).
export const runtime = "nodejs";
// Jamais mis en cache -- chaque recherche doit refleter le prix reel au
// moment de l'appel.
export const dynamic = "force-dynamic";

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const ALIEXPRESS_APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const ALIEXPRESS_APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;

type SearchResult = {
  title: string;
  url: string;
  subtotal: number | null;
  shipping: number | null;
  importFee: number | null;
  total: number | null;
  currency: string;
  source: "scraperapi";
};

function extractProductId(input: string): string | null {
  const urlMatch = input.match(/item\/(\d{9,15})\.html/);
  if (urlMatch) return urlMatch[1];
  const bareId = input.match(/^\d{9,15}$/);
  return bareId ? bareId[0] : null;
}

function buildProductUrl(productId: string): string {
  return `https://www.aliexpress.com/item/${productId}.html`;
}

async function fetchHtmlViaScraperApi(targetUrl: string): Promise<string> {
  if (!SCRAPER_API_KEY) {
    throw new Error(
      "SCRAPER_API_KEY absente -- configurez cette variable (Vercel -> Environment Variables) pour activer la recherche reelle."
    );
  }

  const proxyUrl = new URL("https://api.scraperapi.com/");
  proxyUrl.searchParams.set("api_key", SCRAPER_API_KEY);
  proxyUrl.searchParams.set("url", targetUrl);
  proxyUrl.searchParams.set("render", "true");

  const response = await fetch(proxyUrl.toString(), {
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    throw new Error(`ScraperAPI a repondu avec le statut ${response.status}.`);
  }

  return response.text();
}

function parseNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d,.-]/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

function extractFromJsonLd(html: string): {
  title?: string;
  price?: number;
  currency?: string;
} {
  const matches = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);
      const nodes = Array.isArray(data) ? data : [data];
      const product = nodes.find(
        (node) => node && node["@type"] === "Product"
      );
      if (!product) continue;

      const offer = Array.isArray(product.offers)
        ? product.offers[0]
        : product.offers;

      return {
        title: typeof product.name === "string" ? product.name : undefined,
        price:
          offer?.price !== undefined
            ? Number.parseFloat(String(offer.price))
            : undefined,
        currency:
          typeof offer?.priceCurrency === "string"
            ? offer.priceCurrency
            : undefined,
      };
    } catch {
      // Bloc JSON-LD malforme ou absent sur cette page -- on l'ignore et
      // on continue avec le bloc suivant plutot que de faire echouer toute
      // l'extraction.
      continue;
    }
  }

  return {};
}

function extractShippingAndImportFee(html: string): {
  shipping: number | null;
  importFee: number | null;
} {
  const freeShipping = /(?:free shipping|livraison gratuite)/i.test(html);
  const shippingMatch = html.match(
    /(?:Shipping|Livraison)[^<{}]{0,40}?([\d]+[.,]\d{2})\s*(?:€|EUR)/i
  );
  const importFeeMatch = html.match(
    /(?:Import (?:duty|fee|tax)|Frais? d[’']import|Taxe)[^<{}]{0,60}?([\d]+[.,]\d{2})\s*(?:€|EUR)/i
  );

  return {
    shipping: freeShipping ? 0 : parseNumber(shippingMatch?.[1]),
    importFee: parseNumber(importFeeMatch?.[1]),
  };
}

export async function POST(request: Request) {
  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide -- JSON attendu ({ query: string })." },
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

  const productId = extractProductId(query);

  if (!productId) {
    // La recherche par mot-cle necessiterait de scraper une page de
    // resultats AliExpress puis de choisir un candidat -- pas encore
    // implemente dans cette route. On le dit explicitement plutot que de
    // renvoyer un faux resultat.
    return NextResponse.json(
      {
        error:
          "La recherche par mot-clé n'est pas encore implémentée dans cette route -- collez un lien produit direct (ex : aliexpress.com/item/XXXXXXXXX.html) pour un résultat exact.",
      },
      { status: 501 }
    );
  }

  const targetUrl = buildProductUrl(productId);

  try {
    const html = await fetchHtmlViaScraperApi(targetUrl);
    const { title, price, currency } = extractFromJsonLd(html);
    const { shipping, importFee } = extractShippingAndImportFee(html);

    if (price === undefined || Number.isNaN(price)) {
      return NextResponse.json(
        {
          error:
            "Impossible d'extraire le prix réel de cette annonce -- la page n'a peut-être pas été rendue correctement par ScraperAPI, ou sa structure a changé.",
        },
        { status: 502 }
      );
    }

    const subtotal = price;
    const total = subtotal + (shipping ?? 0) + (importFee ?? 0);

    const result: SearchResult = {
      title: title ?? "Titre indisponible",
      url: targetUrl,
      subtotal,
      shipping,
      importFee,
      total,
      currency: currency ?? "EUR",
      source: "scraperapi",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/search] Échec de l'extraction :", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur inconnue pendant la recherche.",
      },
      { status: 502 }
    );
  }
}

/**
 * Signature HMAC-SHA256 pour l'API produit officielle AliExpress Open
 * Platform (aliexpress.ds.product.get), portee depuis l'implementation
 * validee dans l'app Streamlit d'origine (concatenation triee des
 * parametres, HMAC-SHA256, hex majuscule).
 *
 * NON appelee dans cette route pour l'instant : cette methode necessite en
 * plus un jeton OAuth utilisateur (ALIEXPRESS_ACCESS_TOKEN), qui n'a pas
 * ete fourni avec les identifiants de cette passe -- seul ALIEXPRESS_APP_KEY
 * (identifiant public) et ALIEXPRESS_APP_SECRET ont ete configures.
 * Conservee ici, prete a etre branchee, une fois le flux OAuth reconstruit
 * cote Next.js. D'ici la, ScraperAPI est le seul chemin reellement
 * fonctionnel de cette route.
 */
function signTopRest(
  path: string,
  params: Record<string, string>,
  secret: string
): string {
  const sortedKeys = Object.keys(params).sort();
  const concatenated =
    path + sortedKeys.map((key) => `${key}${params[key]}`).join("");
  return createHmac("sha256", secret)
    .update(concatenated, "utf8")
    .digest("hex")
    .toUpperCase();
}

function isAliExpressApiConfigured(): boolean {
  return Boolean(ALIEXPRESS_APP_KEY && ALIEXPRESS_APP_SECRET);
}

// References volontairement conservees (fonctions ci-dessus) pour une
// future integration -- evite un avertissement "declare mais jamais lu"
// sans les supprimer.
void signTopRest;
void isAliExpressApiConfigured;
