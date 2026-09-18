// Logique de recherche/extraction AliExpress partagee entre
// app/api/search (usage libre, non credite) et app/api/analyze (usage
// credite, debite un credit par analyse reussie). Portee telle quelle
// depuis l'ancienne app/api/search/route.ts -- aucun changement de
// comportement, juste extraite pour eviter de dupliquer ~150 lignes.

import { createHmac } from "crypto";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const ALIEXPRESS_APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const ALIEXPRESS_APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;

/** Statut d'un champ individuel : donnee reellement lue sur la fiche
 * ("confirmed"), repli calcule faute de mieux ("estimated" -- seul
 * importFee peut l'etre, voir estimateImportFee), ou jamais trouvee
 * ("missing" -- reste null, JAMAIS remplacee par 0). */
export type FieldStatus = "confirmed" | "estimated" | "missing";

export type AliExpressSearchResult = {
  title: string;
  /** Variante (couleur/taille/modele) du prix affiche, quand AliExpress la
   * precise dans les donnees structurees de la page -- null si la page ne
   * distingue pas explicitement de variante (prix de l'offre par defaut). */
  variant: string | null;
  /** "confirmed" si une variante precise est identifiee, "missing" sinon --
   * un sous-total "prix de l'offre par defaut" est intrinsequement moins
   * fiable qu'un prix rattache a une variante precise, donc compte dans le
   * calcul de completude du total (voir isComplete). */
  variantStatus: FieldStatus;
  url: string;
  product_image_url: string | null;
  subtotal: number | null;
  shipping: number | null;
  shippingStatus: FieldStatus;
  importFee: number | null;
  importFeeStatus: FieldStatus;
  /** @deprecated conserve pour compatibilite ascendante -- equivalent a
   * importFeeStatus === "estimated". Utiliser importFeeStatus. */
  importFeeEstimated?: boolean;
  /**
   * Cout total REEL, uniquement quand TOUS les composants (livraison,
   * taxes, variante) sont confirmes -- jamais calcule en remplacant un
   * champ manquant par 0. null des qu'un seul champ n'est pas confirme :
   * ne JAMAIS afficher ce cas comme "Coût total" complet cote UI.
   */
  total: number | null;
  /**
   * Cout partiel TOUJOURS calculable (sous-total + les frais reellement
   * connus, les inconnus comptes pour 0 dans CE calcul uniquement) --
   * distinct de `total`, a afficher sous un libelle explicite ("Coût
   * partiel estimé" / "Total hors frais inconnus"), jamais sous "Coût
   * total".
   */
  partialTotal: number;
  /** true seulement quand `total` est non-null (livraison confirmee, taxe
   * confirmee -- pas estimee -- et variante identifiee). Piloté ici plutot
   * que recalcule cote UI pour eviter toute divergence entre les deux. */
  isComplete: boolean;
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

// Bug reel constate en production : toute recherche par mot-cle echouait
// avec "Aucune annonce trouvee", meme sur des termes tres courants. Cause
// racine trouvee en conditions reelles (navigateur, vraies fiches
// produit AliExpress live) : les ID produit actuels font TOUS 16 chiffres
// (ex. 1005012690129627), alors que ce regex plafonnait a 15 (\d{9,15})
// -- il ne matchait donc plus AUCUN lien produit reel, ni en recherche
// par mot-cle (voir findFirstProductIdFromKeyword plus bas) ni en URL
// collee directement. Pas de borne haute desormais (juste une borne basse
// a 9 pour eviter de capturer un petit nombre incident) : le suffixe
// ".html" ou la fin de chaine delimitent deja le nombre, donc une borne
// haute n'apportait aucune securite, seulement un risque de recasser au
// prochain allongement d'ID cote AliExpress.
function extractProductId(input: string): string | null {
  const urlMatch = input.match(/item\/(\d{9,})\.html/);
  if (urlMatch) return urlMatch[1];
  const bareId = input.match(/^\d{9,}$/);
  return bareId ? bareId[0] : null;
}

// Vitrine France (pas www.aliexpress.com/generique) : coherent avec les
// "taxes d'importation" calculees pour une livraison en France, et avec
// les liens fr.aliexpress.com que les utilisateurs collent directement.
function buildProductUrl(productId: string): string {
  return `https://fr.aliexpress.com/item/${productId}.html`;
}

// "Slug" mot-clé -> URL de recherche "jolie" (/w/wholesale-<slug>.html),
// celle vers laquelle https://fr.aliexpress.com/wholesale?SearchText=...
// redirige cote client (JS) dans un vrai navigateur -- un scraper qui ne
// declenche pas cette redirection JS restait bloque sur l'ancienne forme,
// qui renvoie plus souvent une page de verification anti-bot.
// Plage Unicode des diacritiques combinants (accents) apres decomposition
// NFD, U+0300 a U+036F -- construite via String.fromCharCode plutot qu'un
// litteral regex avec sequences d'echappement directes (ambigu a l'edition),
// et sans la syntaxe de propriete Unicode \p{...} qui exigerait une target
// TypeScript ES2018+ (ce projet compile en ES2017).
const COMBINING_DIACRITICS_RANGE = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g"
);

function slugifyKeyword(keyword: string): string {
  return keyword
    .normalize("NFD")
    // Enleve les accents apres decomposition NFD (e.g. "chargeur" reste
    // identique, "câble" -> "cable").
    .replace(COMBINING_DIACRITICS_RANGE, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSearchUrl(keyword: string): string {
  const slug = slugifyKeyword(keyword);
  return `https://fr.aliexpress.com/w/wholesale-${slug}.html`;
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
  // Pas de borne haute sur le nombre de chiffres (voir extractProductId
  // ci-dessus) : les ID produit reels font 16 chiffres aujourd'hui, contre
  // 15 max ici avant correctif -- cause reelle du bug "Aucune annonce
  // trouvée" sur toute recherche par mot-clé constate en production.
  const match = searchHtml.match(/item\\?\/(\d{9,})\.html/);
  return match ? match[1] : null;
}

// Doit laisser de la marge sous maxDuration (voir app/api/search/route.ts
// et app/api/analyze/route.ts) : une recherche par mot-clé peut enchainer
// DEUX appels Firecrawl (page de résultats puis page produit) --
// 2 x 25 s = 50 s, sous le maxDuration=60 configuré sur les deux routes
// (marge plus courte qu'avant : waitFor + proxy "auto" ci-dessous rendent
// chaque appel plus lent, mais necessaires pour contourner le blocage
// anti-bot constate en conditions reelles).
const FIRECRAWL_TIMEOUT_MS = 25000;

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
        // extractFromJsonLd/extractOpenGraphFallback ci-dessous). location
        // force une IP/langue France, coherent avec fr.aliexpress.com
        // ci-dessus, au lieu de laisser Firecrawl choisir un pays de
        // sortie arbitraire.
        formats: ["rawHtml"],
        location: { country: "FR", languages: ["fr"] },
        // AliExpress rend son contenu (prix, JSON-LD) cote client en React
        // -- sans attendre, Firecrawl peut capturer une coquille HTML
        // encore vide. "auto" n'escalade vers un proxy anti-detection
        // (plus lent/couteux) que si la premiere tentative se heurte a un
        // blocage -- jamais systematiquement, pour ne pas payer ce cout
        // sur chaque recherche qui passe deja sans probleme.
        waitFor: 3000,
        proxy: "auto",
        // Doit rester sous FIRECRAWL_TIMEOUT_MS (l'AbortSignal ci-dessous) :
        // sinon notre propre abort coupe la requete avant que Firecrawl
        // n'ait la chance de renvoyer sa propre erreur de timeout, geree
        // plus proprement (voir !payload.success plus bas).
        timeout: 22000,
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

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function metaContent(html: string, property: string): string | undefined {
  const match = html.match(
    new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]+)"`, "i")
  );
  return match ? decodeHtmlEntities(match[1]) : undefined;
}

/**
 * Repli sur les balises OpenGraph/meta basiques (title/image/price),
 * presentes sur des pages qu'un blocage anti-bot "doux" ou une reponse
 * partielle laisse encore dans le HTML alors que le JSON-LD complet est
 * absent ou coupe. Utilise uniquement pour construire une fiche produit
 * quand extractFromJsonLd n'a pas suffi -- jamais pour inventer une
 * valeur : chaque champ reste absent si sa balise ne l'est pas.
 */
function extractOpenGraphFallback(html: string): {
  title?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
} {
  const title = metaContent(html, "og:title");
  const imageUrl = metaContent(html, "og:image");
  const priceRaw =
    metaContent(html, "product:price:amount") ?? metaContent(html, "og:price:amount");
  const currency =
    metaContent(html, "product:price:currency") ?? metaContent(html, "og:price:currency");
  const price = priceRaw ? Number.parseFloat(priceRaw.replace(",", ".")) : undefined;

  return {
    title,
    imageUrl,
    currency,
    price: price !== undefined && Number.isFinite(price) ? price : undefined,
  };
}

// Marqueurs de debut des blocs "hors produit principal" (avis clients,
// recommandations, articles similaires) verifies en conditions reelles
// (navigateur, fiche produit AliExpress live) : le bloc "Vous aimerez
// aussi" contient les prix/badges "Livraison gratuite" d'articles
// totalement differents, et un ancien regex non borne au bloc du produit
// principal pouvait "trouver" un prix de livraison appartenant a un tout
// autre article recommande plus bas sur la meme page -- cause reelle
// constatee du bug "frais de port errone" (ex. 1,00€ au lieu du vrai
// montant, ou d'un montant absent).
const OFF_PRODUCT_SECTION_MARKERS = [
  "Avis des acheteurs",
  "Customer Reviews",
  "Vous aimerez aussi",
  "You may also like",
  "Articles similaires",
  "Produits similaires",
];

/** Coupe le HTML avant le premier bloc "hors produit principal" trouve
 * (voir OFF_PRODUCT_SECTION_MARKERS) pour que toute extraction ulterieure
 * ne puisse plus remonter un prix/une livraison appartenant a un article
 * recommande ou a un avis client plutot qu'au produit reellement analyse.
 * Si aucun marqueur n'est trouve, renvoie le HTML complet tel quel (pas
 * pire que le comportement precedent). */
function isolateMainProductHtml(html: string): string {
  let cutoff = html.length;
  for (const marker of OFF_PRODUCT_SECTION_MARKERS) {
    const idx = html.indexOf(marker);
    if (idx !== -1 && idx < cutoff) cutoff = idx;
  }
  return html.slice(0, cutoff);
}

/** Mots indiquant un SEUIL ou une CONDITION ("gratuit des 10€ d'achat",
 * "a partir de 2,99€") plutot que le cout reel de livraison/taxe de CE
 * produit -- un montant precede de l'un de ces mots entre le libelle et
 * le nombre est ignore plutot que pris pour argent comptant. */
const THRESHOLD_WORDS = /d[eè]s|jusqu'?\s*[aà]|a partir|à partir|minimum/i;

/** Parcourt TOUTES les occurrences de `pattern` (doit avoir le flag "g")
 * et renvoie le nombre du premier match dont le texte entre le libelle et
 * le nombre (groupe 1) ne contient aucun THRESHOLD_WORDS -- un premier
 * match rejete (ex. bandeau promo "Livraison gratuite des 10€") ne doit
 * pas empecher de trouver un second match plus loin dans la page qui, lui,
 * donne le vrai cout de CE produit (ex. "Livraison : 5,41 €" plus bas dans
 * le bloc d'achat). */
function findFirstValidAmount(html: string, pattern: RegExp): string | null {
  for (const match of html.matchAll(pattern)) {
    if (!THRESHOLD_WORDS.test(match[1])) return match[2];
  }
  return null;
}

function extractShippingAndImportFee(html: string): {
  shipping: number | null;
  importFee: number | null;
} {
  const mainHtml = isolateMainProductHtml(html);

  // "Livraison gratuite" veut dire livraison gratuite SANS condition --
  // mais la meme phrase apparait aussi dans des bannieres conditionnelles
  // ("Livraison gratuite des 10,00€ d'achat", verifie sur une fiche
  // produit live) qui ne garantissent rien pour CE produit precis. Rejete
  // si un mot de seuil suit "gratuite" a moins de ~20 caracteres -- meme
  // logique de balayage complet (pas juste la 1ere occurrence) que
  // findFirstValidAmount ci-dessus.
  const freeShipping = [...mainHtml.matchAll(/(?:free shipping|livraison gratuite)([^<{}]{0,20})/gi)]
    .some((match) => !THRESHOLD_WORDS.test(match[1]));

  const shippingRaw = findFirstValidAmount(
    mainHtml,
    /(?:Shipping|Livraison)\s*:?\s*([^<{}]{0,40}?)([\d]+[.,]\d{2})\s*(?:€|EUR)/gi
  );
  const importFeeRaw = findFirstValidAmount(
    mainHtml,
    /(?:Import (?:duty|fee|tax)|Frais? d[’']import|Droits? de douane|Taxe)\s*:?\s*([^<{}]{0,60}?)([\d]+[.,]\d{2})\s*(?:€|EUR)/gi
  );

  return {
    shipping: freeShipping ? 0 : parseNumber(shippingRaw),
    importFee: parseNumber(importFeeRaw),
  };
}

// Taux de TVA France applique en estimation UNIQUEMENT quand la fiche
// produit ne permet pas de lire un vrai montant de taxes d'importation --
// AliExpress affiche tres souvent "Les droits de douane sont calcules
// lors du paiement" (verifie en conditions reelles sur des fiches
// produit live) : ce montant n'existe alors nulle part avant l'etape de
// paiement reelle, inaccessible a un scraper anonyme. Plutot que
// d'afficher un cout total silencieusement sous-estime (bug constate :
// total manquant les taxes d'importation), une estimation FR est
// appliquee et explicitement marquee comme telle (importFeeEstimated),
// jamais presentee comme une valeur "confirmee".
const ESTIMATED_VAT_RATE = 0.2;

function estimateImportFee(subtotal: number): number {
  return Math.round(subtotal * ESTIMATED_VAT_RATE * 100) / 100;
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

  // La page peut etre veritablement bloquee (verification anti-bot,
  // longueur quasi nulle) OU seulement partiellement rendue -- dans les
  // deux cas, on ne rejette plus immediatement : le JSON-LD peut manquer
  // tout en laissant les balises OpenGraph/meta de base exploitables (voir
  // extractOpenGraphFallback). Seule l'absence totale de donnees
  // utilisables (ni JSON-LD, ni repli OG) declenche une vraie erreur plus
  // bas -- jamais une fiche avec un prix invente. extractFromJsonLd()
  // reste sans danger a appeler meme sur une page bloquee : elle ne
  // trouve simplement aucun <script type="application/ld+json"> a
  // parser et renvoie {}.
  const blocked = looksLikeBotBlock(html);
  const fromJsonLd = extractFromJsonLd(html);

  let title = fromJsonLd.title;
  let price = fromJsonLd.price;
  let currency = fromJsonLd.currency;
  let imageUrl = fromJsonLd.imageUrl;
  const variant = fromJsonLd.variant;
  const rating = fromJsonLd.rating;
  const reviewCount = fromJsonLd.reviewCount;

  if (price === undefined || Number.isNaN(price)) {
    // On entre ici uniquement quand JSON-LD n'a pas donne de prix
    // exploitable -- price vaut donc deja undefined/NaN, le repli le
    // remplace purement et simplement (jamais l'inverse : jamais ecraser
    // un prix JSON-LD valide par une valeur OpenGraph moins fiable).
    const fallback = extractOpenGraphFallback(html);
    title = title ?? fallback.title;
    price = fallback.price;
    currency = currency ?? fallback.currency;
    imageUrl = imageUrl ?? fallback.imageUrl;
  }

  if (price === undefined || Number.isNaN(price)) {
    throw new AliExpressSearchError(
      blocked
        ? "AliExpress a limité ou bloqué l'accès à cette annonce pour le moment, et aucune donnée de secours n'a pu être récupérée. Réessayez dans quelques instants."
        : "Cette annonce a peut-être été retirée, ou sa page n'a pas pu être analysée correctement. Vérifiez le lien, ou réessayez dans quelques instants.",
      blocked ? 503 : 502
    );
  }

  // Meme logique que fromJsonLd ci-dessus : sans danger a tenter meme sur
  // une page partiellement bloquee, se degrade simplement en null si rien
  // n'est trouve plutot que d'echouer.
  const { shipping, importFee: extractedImportFee } = extractShippingAndImportFee(html);

  const subtotal = price;

  // AliExpress n'affiche tres souvent AUCUN montant de taxes d'importation
  // sur la fiche produit elle-meme ("Les droits de douane sont calcules
  // lors du paiement", verifie en conditions reelles) : ce montant existe
  // seulement a l'etape de paiement reelle, inaccessible a ce scraper.
  // Repli explicite sur une estimation TVA France 20% du sous-total,
  // TOUJOURS marque importFeeStatus: "estimated" -- jamais "confirmed".
  const importFeeStatus: FieldStatus = extractedImportFee === null ? "estimated" : "confirmed";
  const importFee = extractedImportFee ?? estimateImportFee(subtotal);
  const shippingStatus: FieldStatus = shipping === null ? "missing" : "confirmed";
  const variantStatus: FieldStatus = variant ? "confirmed" : "missing";

  // `total` = cout REEL, uniquement si tout est confirme (jamais un champ
  // manquant remplace par 0 dans CE calcul). `partialTotal` reste toujours
  // calculable (fournisseurs manquants comptes pour 0 dans ce calcul-la
  // uniquement) pour un affichage explicitement partiel cote UI -- jamais
  // sous le libelle "Coût total".
  const isComplete =
    shippingStatus === "confirmed" &&
    importFeeStatus === "confirmed" &&
    variantStatus === "confirmed";
  const partialTotal = subtotal + (shipping ?? 0) + importFee;
  const total = isComplete ? partialTotal : null;

  return {
    title: title ?? "Titre indisponible",
    variant: variant ?? null,
    variantStatus,
    url: targetUrl,
    product_image_url: imageUrl ?? null,
    subtotal,
    shipping,
    shippingStatus,
    importFee,
    importFeeStatus,
    importFeeEstimated: importFeeStatus === "estimated",
    total,
    partialTotal,
    isComplete,
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
