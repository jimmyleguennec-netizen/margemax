// Logique de recherche/extraction AliExpress partagee entre
// app/api/search (usage libre, non credite) et app/api/analyze (usage
// credite, debite un credit par analyse reussie). Portee telle quelle
// depuis l'ancienne app/api/search/route.ts -- aucun changement de
// comportement, juste extraite pour eviter de dupliquer ~150 lignes.

import { createHmac } from "crypto";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const ALIEXPRESS_APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const ALIEXPRESS_APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;

export type AliExpressSearchResult = {
  title: string;
  /** Variante (couleur/taille/modele) du prix affiche, quand AliExpress la
   * precise dans les donnees structurees de la page -- null si la page ne
   * distingue pas explicitement de variante (prix de l'offre par defaut). */
  variant: string | null;
  url: string;
  product_image_url: string | null;
  subtotal: number | null;
  shipping: number | null;
  importFee: number | null;
  total: number | null;
  currency: string;
  /** Note moyenne (/5) et nombre d'avis, depuis aggregateRating des donnees
   * structurees JSON-LD -- null si l'annonce n'en expose pas (toutes ne le
   * font pas), jamais une valeur inventee. */
  rating: number | null;
  reviewCount: number | null;
  source: "firecrawl";
  /** Pays cible des taxes d'importation calculees (voir location.country
   * passe a Firecrawl dans fetchHtmlViaFirecrawl). */
  destination: "FR";
  /** Horodatage serveur de l'analyse (ISO 8601) -- pas l'horodatage client,
   * qui peut deriver ou etre falsifie. */
  analyzedAt: string;
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

// Vitrine France (pas www.aliexpress.com/generique) : coherent avec les
// "taxes d'importation" calculees pour une livraison en France, et avec
// les liens fr.aliexpress.com que les utilisateurs collent directement.
function buildProductUrl(productId: string): string {
  return `https://fr.aliexpress.com/item/${productId}.html`;
}

function buildSearchUrl(keyword: string): string {
  const url = new URL("https://fr.aliexpress.com/wholesale");
  url.searchParams.set("SearchText", keyword);
  return url.toString();
}

/**
 * Marqueurs de blocage anti-bot/CAPTCHA couramment renvoyes par
 * AliExpress a un scraper (page "Access Denied", verification humaine,
 * etc.). Une page ainsi bloquee ne contient jamais de veritable resultat
 * de recherche -- la confondre avec "0 resultat" masquerait une panne
 * fournisseur derriere un message qui dit le contraire de la realite.
 */
const BOT_BLOCK_MARKERS = [
  /access denied/i,
  /captcha/i,
  /verify you are human/i,
  /unusual traffic/i,
  /punish/i, // page anti-bot AliExpress connue ("_______x_______punish")
  /attention required/i, // titre classique d'une page de blocage Cloudflare
  /checking your browser before accessing/i,
  /enable javascript and cookies to continue/i,
];

function looksLikeBotBlock(html: string): boolean {
  // Une vraie page de resultats AliExpress fait plusieurs dizaines de Ko ;
  // une page de blocage/erreur est generalement tres courte.
  if (html.length < 2000) return true;
  return BOT_BLOCK_MARKERS.some((marker) => marker.test(html));
}

async function findFirstProductIdFromKeyword(
  keyword: string
): Promise<string | null> {
  const searchHtml = await fetchHtmlViaFirecrawl(buildSearchUrl(keyword));

  if (looksLikeBotBlock(searchHtml)) {
    // Distinct de "0 resultat" : le fournisseur a bloque/limite la
    // requete, ce n'est pas une absence reelle de resultats.
    throw new AliExpressSearchError(
      "AliExpress a limité ou bloqué cette recherche pour le moment — réessayez dans quelques instants, ou collez directement le lien de l'annonce.",
      503
    );
  }

  // Formes rencontrees dans le HTML de résultats AliExpress : lien absolu
  // (https://...item/ID.html), protocol-relative (//...item/ID.html),
  // simple chemin (/item/ID.html), ou echappe dans un bloc JSON inline
  // (...item\/ID.html, present dans certains etats React/Vue serialises)
  // selon la page/le rendu -- \\? rend le antislash d'echappement optionnel.
  const match = searchHtml.match(/item\\?\/(\d{9,15})\.html/);
  return match ? match[1] : null;
}

// Doit laisser de la marge sous maxDuration (voir app/api/search/route.ts
// et app/api/analyze/route.ts) : une recherche par mot-clé peut enchainer
// DEUX appels Firecrawl (page de résultats puis page produit) --
// 2 x 20 s = 40 s, sous le maxDuration=60 configuré sur les deux routes.
const FIRECRAWL_TIMEOUT_MS = 20000;

type FirecrawlScrapeResponse = {
  success: boolean;
  data?: { rawHtml?: string };
  error?: string;
};

async function fetchHtmlViaFirecrawl(targetUrl: string): Promise<string> {
  if (!FIRECRAWL_API_KEY) {
    throw new AliExpressSearchError(
      "FIRECRAWL_API_KEY absente — configurez cette variable (Vercel -> Environment Variables) pour activer la recherche réelle.",
      502
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: targetUrl,
        // "rawHtml" (pas "html", qui est nettoye par Firecrawl et peut
        // retirer les <script type="application/ld+json"> dont dependent
        // extractFromJsonLd/extractOgImage ci-dessous). location force une
        // IP/langue France, coherent avec fr.aliexpress.com ci-dessus, au
        // lieu de laisser Firecrawl choisir un pays de sortie arbitraire.
        formats: ["rawHtml"],
        location: { country: "FR", languages: ["fr"] },
        timeout: 18000,
      }),
      signal: AbortSignal.timeout(FIRECRAWL_TIMEOUT_MS),
    });
  } catch (err) {
    // AbortSignal.timeout() declenche une DOMException "TimeoutError" dont
    // le .message ("The operation was aborted due to timeout") est en
    // anglais et ne doit JAMAIS atteindre l'utilisateur tel quel -- avant
    // ce correctif (session precedente), cette exception remontait non
    // enveloppee jusqu'a l'API route, qui renvoyait error.message brut au
    // client (voir performAliExpressSearch plus bas : seule une
    // AliExpressSearchError a un message deja destine a l'utilisateur).
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    if (isTimeout) {
      throw new AliExpressSearchError(
        "Le fournisseur de données met trop de temps à répondre (délai dépassé). Réessayez dans quelques instants.",
        504
      );
    }
    throw new AliExpressSearchError(
      "Impossible de contacter le fournisseur de données pour le moment. Réessayez dans quelques instants.",
      502
    );
  }

  if (!response.ok) {
    throw new AliExpressSearchError(
      response.status === 429
        ? "Trop de recherches en cours — le fournisseur limite temporairement les requêtes. Réessayez dans quelques instants."
        : `Le fournisseur de données a répondu avec une erreur (code ${response.status}). Réessayez dans quelques instants.`,
      502
    );
  }

  let payload: FirecrawlScrapeResponse;
  try {
    payload = await response.json();
  } catch {
    throw new AliExpressSearchError(
      "Réponse du fournisseur de données illisible. Réessayez dans quelques instants.",
      502
    );
  }

  if (!payload.success || !payload.data?.rawHtml) {
    throw new AliExpressSearchError(
      payload.error
        ? `Le fournisseur de données n'a pas pu récupérer cette page (${payload.error}).`
        : "Le fournisseur de données n'a pas pu récupérer cette page. Réessayez dans quelques instants.",
      502
    );
  }

  return payload.data.rawHtml;
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
  variant?: string;
  rating?: number;
  reviewCount?: number;
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

      // AliExpress ne distingue pas toujours la variante (couleur/taille)
      // dans ces donnees structurees : offer.name n'existe/ne differe du
      // titre produit que pour certaines annonces. On ne l'affiche que
      // dans ce cas precis plutot que d'inventer une variante par defaut.
      const offerName = typeof offer?.name === "string" ? offer.name : undefined;
      const productName = typeof product.name === "string" ? product.name : undefined;
      const variant = offerName && offerName !== productName ? offerName : undefined;

      // aggregateRating n'est pas toujours present (toutes les annonces ne
      // l'exposent pas dans leurs donnees structurees) -- undefined plutot
      // qu'une valeur par defaut si absent ou non numerique.
      const aggregateRating = product.aggregateRating;
      const ratingValue =
        aggregateRating?.ratingValue !== undefined
          ? Number.parseFloat(String(aggregateRating.ratingValue))
          : undefined;
      const reviewCountValue =
        aggregateRating?.reviewCount !== undefined
          ? Number.parseInt(String(aggregateRating.reviewCount), 10)
          : aggregateRating?.ratingCount !== undefined
            ? Number.parseInt(String(aggregateRating.ratingCount), 10)
            : undefined;

      return {
        title: productName,
        price:
          offer?.price !== undefined ? Number.parseFloat(String(offer.price)) : undefined,
        currency: typeof offer?.priceCurrency === "string" ? offer.priceCurrency : undefined,
        imageUrl: typeof rawImage === "string" ? rawImage : undefined,
        variant,
        rating: Number.isFinite(ratingValue) ? ratingValue : undefined,
        reviewCount: Number.isFinite(reviewCountValue) ? reviewCountValue : undefined,
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
      "Aucune annonce trouvée pour ce mot-clé sur AliExpress. Essayez un terme plus précis ou collez un lien produit direct.",
      404
    );
  }

  const targetUrl = buildProductUrl(productId);
  const html = await fetchHtmlViaFirecrawl(targetUrl);

  if (looksLikeBotBlock(html)) {
    throw new AliExpressSearchError(
      "AliExpress a limité ou bloqué l'accès à cette annonce pour le moment. Réessayez dans quelques instants.",
      503
    );
  }

  const { title, price, currency, imageUrl, variant, rating, reviewCount } =
    extractFromJsonLd(html);
  const { shipping, importFee } = extractShippingAndImportFee(html);
  const productImageUrl = imageUrl ?? extractOgImage(html) ?? null;

  if (price === undefined || Number.isNaN(price)) {
    throw new AliExpressSearchError(
      "Cette annonce a peut-être été retirée, ou sa page n'a pas pu être analysée correctement. Vérifiez le lien, ou réessayez dans quelques instants.",
      502
    );
  }

  const subtotal = price;
  const total = subtotal + (shipping ?? 0) + (importFee ?? 0);

  return {
    title: title ?? "Titre indisponible",
    variant: variant ?? null,
    url: targetUrl,
    product_image_url: productImageUrl,
    subtotal,
    shipping,
    importFee,
    total,
    currency: currency ?? "EUR",
    rating: rating ?? null,
    reviewCount: reviewCount ?? null,
    source: "firecrawl",
    destination: "FR",
    analyzedAt: new Date().toISOString(),
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
 * flux OAuth reconstruit cote Next.js. D'ici la, Firecrawl est le seul
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
