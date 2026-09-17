// Logique de recherche/extraction AliExpress partagee entre
// app/api/search (usage libre, non credite) et app/api/analyze (usage
// credite, debite un credit par analyse reussie). Portee telle quelle
// depuis l'ancienne app/api/search/route.ts -- aucun changement de
// comportement, juste extraite pour eviter de dupliquer ~150 lignes.

import { createHmac } from "crypto";

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const ALIEXPRESS_APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const ALIEXPRESS_APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;

export type AliExpressSearchResult = {
  title: string;
  url: string;
  product_image_url: string | null;
  subtotal: number | null;
  shipping: number | null;
  importFee: number | null;
  total: number | null;
  currency: string;
  source: "scraperapi";
};

export class AliExpressSearchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AliExpressSearchError";
    this.status = status;
  }
}

function extractProductId(input: string): string | null {
  const urlMatch = input.match(/item\/(\d{9,15})\.html/);
  if (urlMatch) return urlMatch[1];
  const bareId = input.match(/^\d{9,15}$/);
  return bareId ? bareId[0] : null;
}

function buildProductUrl(productId: string): string {
  return `https://www.aliexpress.com/item/${productId}.html`;
}

function buildSearchUrl(keyword: string): string {
  const url = new URL("https://www.aliexpress.com/wholesale");
  url.searchParams.set("SearchText", keyword);
  return url.toString();
}

async function findFirstProductIdFromKeyword(
  keyword: string
): Promise<string | null> {
  const searchHtml = await fetchHtmlViaScraperApi(buildSearchUrl(keyword));
  const match = searchHtml.match(/item\/(\d{9,15})\.html/);
  return match ? match[1] : null;
}

async function fetchHtmlViaScraperApi(targetUrl: string): Promise<string> {
  if (!SCRAPER_API_KEY) {
    throw new AliExpressSearchError(
      "SCRAPER_API_KEY absente -- configurez cette variable (Vercel -> Environment Variables) pour activer la recherche réelle.",
      502
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
    throw new AliExpressSearchError(
      `ScraperAPI a répondu avec le statut ${response.status}.`,
      502
    );
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
  imageUrl?: string;
} {
  const matches = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);
      const nodes = Array.isArray(data) ? data : [data];
      const product = nodes.find((node) => node && node["@type"] === "Product");
      if (!product) continue;

      const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      const rawImage = Array.isArray(product.image) ? product.image[0] : product.image;

      return {
        title: typeof product.name === "string" ? product.name : undefined,
        price:
          offer?.price !== undefined ? Number.parseFloat(String(offer.price)) : undefined,
        currency: typeof offer?.priceCurrency === "string" ? offer.priceCurrency : undefined,
        imageUrl: typeof rawImage === "string" ? rawImage : undefined,
      };
    } catch {
      continue;
    }
  }

  return {};
}

function extractOgImage(html: string): string | undefined {
  const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
  return match?.[1];
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

/**
 * Lance la recherche/extraction AliExpress reelle. Leve
 * AliExpressSearchError (avec un status HTTP adapte) en cas d'echec --
 * a l'appelant de decider s'il debite un credit ou non selon que cette
 * fonction resout ou rejette.
 */
export async function performAliExpressSearch(
  query: string
): Promise<AliExpressSearchResult> {
  const directProductId = extractProductId(query);
  const productId = directProductId ?? (await findFirstProductIdFromKeyword(query));

  if (!productId) {
    throw new AliExpressSearchError(
      "Aucune annonce trouvée pour ce mot-clé sur AliExpress -- essayez un terme plus précis ou collez un lien produit direct.",
      404
    );
  }

  const targetUrl = buildProductUrl(productId);
  const html = await fetchHtmlViaScraperApi(targetUrl);
  const { title, price, currency, imageUrl } = extractFromJsonLd(html);
  const { shipping, importFee } = extractShippingAndImportFee(html);
  const productImageUrl = imageUrl ?? extractOgImage(html) ?? null;

  if (price === undefined || Number.isNaN(price)) {
    throw new AliExpressSearchError(
      "Impossible d'extraire le prix réel de cette annonce -- la page n'a peut-être pas été rendue correctement par ScraperAPI, ou sa structure a changé.",
      502
    );
  }

  const subtotal = price;
  const total = subtotal + (shipping ?? 0) + (importFee ?? 0);

  return {
    title: title ?? "Titre indisponible",
    url: targetUrl,
    product_image_url: productImageUrl,
    subtotal,
    shipping,
    importFee,
    total,
    currency: currency ?? "EUR",
    source: "scraperapi",
  };
}

/**
 * Signature HMAC-SHA256 pour l'API produit officielle AliExpress Open
 * Platform (aliexpress.ds.product.get), portee depuis l'implementation
 * validee dans l'app Streamlit d'origine (concatenation triee des
 * parametres, HMAC-SHA256, hex majuscule).
 *
 * NON appelee pour l'instant : cette methode necessite en plus un jeton
 * OAuth utilisateur (ALIEXPRESS_ACCESS_TOKEN), qui n'a pas ete fourni --
 * seul ALIEXPRESS_APP_KEY (identifiant public) et ALIEXPRESS_APP_SECRET
 * ont ete configures. Conservee ici, prete a etre branchee, une fois le
 * flux OAuth reconstruit cote Next.js. D'ici la, ScraperAPI est le seul
 * chemin reellement fonctionnel.
 */
export function signTopRest(
  path: string,
  params: Record<string, string>,
  secret: string
): string {
  const sortedKeys = Object.keys(params).sort();
  const concatenated = path + sortedKeys.map((key) => `${key}${params[key]}`).join("");
  return createHmac("sha256", secret).update(concatenated, "utf8").digest("hex").toUpperCase();
}

export function isAliExpressApiConfigured(): boolean {
  return Boolean(ALIEXPRESS_APP_KEY && ALIEXPRESS_APP_SECRET);
}
