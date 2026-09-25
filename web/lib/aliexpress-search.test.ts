import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { performAliExpressSearch } from "./aliexpress-search";

const PRODUCT_URL = "https://fr.aliexpress.com/item/1005012690129627.html";

function jsonLd(price: string, offerName?: string): string {
  const product: Record<string, unknown> = {
    "@type": "Product",
    name: "Chargeur induction 15W",
    offers: {
      price,
      priceCurrency: "EUR",
      ...(offerName ? { name: offerName } : {}),
    },
  };
  return `<script type="application/ld+json">${JSON.stringify(product)}</script>`;
}

/** Simule le contenu HTML d'une vraie fiche produit -- assez long pour ne
 * jamais etre pris pour une page de blocage anti-bot (looksLikeBotBlock
 * rejette tout HTML de moins de 2000 caracteres). */
function fakeProductHtml(opts: {
  price?: string;
  offerName?: string;
  shippingLine?: string;
  taxLine?: string;
  offProductDecoy?: string;
}): string {
  const padding = "x".repeat(2500);
  return `<html><body>${padding}
    ${jsonLd(opts.price ?? "11.19", opts.offerName)}
    ${opts.shippingLine ?? ""}
    ${opts.taxLine ?? ""}
    Avis des acheteurs
    ${opts.offProductDecoy ?? ""}
  </body></html>`;
}

function mockFirecrawlSuccess(rawHtml: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { rawHtml } }),
    }))
  );
}

describe("performAliExpressSearch — complétude du résultat", () => {
  beforeEach(() => {
    vi.stubEnv("FIRECRAWL_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("résultat complet : livraison + taxe confirmées + variante connue -> isComplete=true, total non null", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        offerName: "Chargeur induction 15W - Coloris blanc",
        shippingLine: "Livraison : 5,41 €",
        taxLine: "Droits de douane : 3,61 €",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);

    expect(result.shippingStatus).toBe("confirmed");
    expect(result.importFeeStatus).toBe("confirmed");
    expect(result.variantStatus).toBe("confirmed");
    expect(result.isComplete).toBe(true);
    expect(result.shipping).toBeCloseTo(5.41, 5);
    expect(result.importFee).toBeCloseTo(3.61, 5);
    expect(result.total).not.toBeNull();
    expect(result.total).toBeCloseTo(11.19 + 5.41 + 3.61, 5);
    expect(result.partialTotal).toBeCloseTo(result.total as number, 5);
  });

  it("résultat incomplet : livraison introuvable -> estimée à 1,99 € (shippingStatus=estimated), jamais 0, total null", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        // Pas de ligne de livraison du tout.
        taxLine: "Droits de douane : 3,61 €",
        offerName: "Variante A",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);

    expect(result.shippingStatus).toBe("estimated");
    expect(result.shipping).toBeCloseTo(1.99, 5); // estimation par défaut, jamais 0
    expect(result.isComplete).toBe(false);
    expect(result.total).toBeNull(); // jamais affiché comme "Coût total" complet
    // Le coût partiel inclut la livraison estimée.
    expect(result.partialTotal).toBeCloseTo(11.19 + 1.99 + 3.61, 5);
  });

  it("taxe non trouvée -> estimation TVA 20% appliquée et marquée estimated, jamais confirmed", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        shippingLine: "Livraison : 5,41 €",
        // Pas de ligne de taxe du tout.
        offerName: "Variante A",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);

    expect(result.importFeeStatus).toBe("estimated");
    expect(result.importFeeEstimated).toBe(true);
    // max(3,60 ; (11.19 + 5.41) * 0.20 = 3,32) = plancher 3,60 €.
    expect(result.importFee).toBeCloseTo(3.6, 5);
    expect(result.isComplete).toBe(false);
    expect(result.total).toBeNull();
  });

  it("arrondi de l'estimation TVA au centime le plus proche", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "29.995",
        shippingLine: "Livraison : 1,00 €",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);
    // (29.995 + 1.00) * 0.20 = 6.199 (> plancher 3,60) -> arrondi à 6,20 €.
    expect(result.importFee).toBeCloseTo(6.2, 5);
  });

  it("variante non identifiée -> variantStatus=missing, empêche isComplete même si livraison/taxe confirmées", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        shippingLine: "Livraison : 5,41 €",
        taxLine: "Droits de douane : 3,61 €",
        // Pas de offerName distinct du nom produit -> variant null.
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);

    expect(result.variant).toBeNull();
    expect(result.variantStatus).toBe("missing");
    expect(result.isComplete).toBe(false);
    expect(result.total).toBeNull();
    expect(result.partialTotal).toBeCloseTo(11.19 + 5.41 + 3.61, 5);
  });

  it("plusieurs variantes de prix différents -> variantStatus=missing, avertissement, fourchette, jamais complet", async () => {
    const product = {
      "@type": "Product",
      name: "Chargeur induction 15W",
      offers: [
        { price: "9.90", priceCurrency: "EUR", name: "Blanc" },
        { price: "14.50", priceCurrency: "EUR", name: "Noir" },
      ],
    };
    const html = `<html><body>${"x".repeat(2500)}
      <script type="application/ld+json">${JSON.stringify(product)}</script>
      Livraison : 5,41 €
      Droits de douane : 3,61 €
      Avis des acheteurs
    </body></html>`;
    mockFirecrawlSuccess(html);

    const result = await performAliExpressSearch(PRODUCT_URL);

    expect(result.variantStatus).toBe("missing");
    expect(result.variantWarning).toBe(
      "Prix basé sur l'offre d'appel. Le checkout réel peut varier selon la variante sélectionnée."
    );
    expect(result.variantPriceRange).toEqual({ low: 9.9, high: 14.5 });
    expect(result.isComplete).toBe(false);
    expect(result.total).toBeNull();
  });

  it("livraison gratuite sans condition -> shipping=0 confirmé (jamais null)", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        shippingLine: "Livraison gratuite",
        taxLine: "Droits de douane : 3,61 €",
        offerName: "Variante A",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);
    expect(result.shipping).toBe(0);
    expect(result.shippingStatus).toBe("confirmed");
    expect(result.isComplete).toBe(true);
  });

  it("bandeau promo conditionnel (« Livraison gratuite dès 10,00€ ») n'est jamais pris pour le vrai coût", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        shippingLine: "Livraison gratuite dès 10,00€ d'achat. Livraison : 5,41 €",
        taxLine: "Droits de douane : 3,61 €",
        offerName: "Variante A",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);
    // Ne doit ni être gratuit (0) ni être 10,00 (seuil promo) : doit trouver
    // le vrai montant plus loin dans le texte.
    expect(result.shipping).toBeCloseTo(5.41, 5);
  });

  it("prix/livraison d'un article recommandé plus bas sur la page (hors bloc produit) est ignoré", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        shippingLine: "Livraison : 5,41 €",
        taxLine: "Droits de douane : 3,61 €",
        offerName: "Variante A",
        offProductDecoy: "Livraison gratuite Livraison : 1,00 €",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);
    // Le decoy est placé après le marqueur "Avis des acheteurs" (hors bloc
    // produit principal, voir isolateMainProductHtml) : ne doit jamais
    // influencer le résultat.
    expect(result.shipping).toBeCloseTo(5.41, 5);
  });
});

describe("performAliExpressSearch — erreurs", () => {
  beforeEach(() => {
    vi.stubEnv("FIRECRAWL_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("annonce introuvable (prix illisible, page non bloquée) -> erreur 502 explicite, pas de prix inventé", async () => {
    mockFirecrawlSuccess(`<html><body>${"x".repeat(2500)} rien à extraire ici</body></html>`);

    await expect(performAliExpressSearch(PRODUCT_URL)).rejects.toMatchObject({
      status: 502,
    });
  });

  it("page de blocage anti-bot détectée -> erreur 503 distincte d'un résultat vide", async () => {
    mockFirecrawlSuccess("Access Denied");

    await expect(performAliExpressSearch(PRODUCT_URL)).rejects.toMatchObject({
      status: 503,
    });
  });

  it("timeout Firecrawl -> erreur 504, message jamais l'exception brute en anglais", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const err = new DOMException("The operation was aborted due to timeout", "TimeoutError");
        throw err;
      })
    );

    const promise = performAliExpressSearch(PRODUCT_URL);
    await expect(promise).rejects.toMatchObject({ status: 504 });
    await expect(promise).rejects.toThrow(/délai dépassé/i);
  });

  it("erreur réseau générique -> erreur 502 avec message destiné à l'utilisateur", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      })
    );

    await expect(performAliExpressSearch(PRODUCT_URL)).rejects.toMatchObject({ status: 502 });
  });

  it("mot-clé sans aucun ID produit trouvable -> erreur 404 (pas de blocage détecté)", async () => {
    mockFirecrawlSuccess(`<html><body>${"x".repeat(2500)} aucun lien produit ici</body></html>`);

    await expect(performAliExpressSearch("produit totalement introuvable")).rejects.toMatchObject(
      { status: 404 }
    );
  });
});

describe("performAliExpressSearch — retry sur panne transitoire du fournisseur", () => {
  const ok = () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: { rawHtml: fakeProductHtml({ price: "11.19" }) } }),
  });
  const httpError = (status: number) => ({ ok: false, status, json: async () => ({}) });

  beforeEach(() => {
    vi.stubEnv("FIRECRAWL_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("502 du fournisseur puis succès -> une seule nouvelle tentative, résultat renvoyé", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(httpError(502)).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);

    await expect(performAliExpressSearch(PRODUCT_URL)).resolves.toMatchObject({ subtotal: 11.19 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("timeout puis succès -> résultat renvoyé après retry", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("timeout", "TimeoutError"))
      .mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);

    await expect(performAliExpressSearch(PRODUCT_URL)).resolves.toMatchObject({ subtotal: 11.19 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("500 deux fois de suite -> abandon après 2 tentatives maximum, erreur 502 (aucun résultat inventé)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(httpError(500));
    vi.stubGlobal("fetch", fetchMock);

    await expect(performAliExpressSearch(PRODUCT_URL)).rejects.toMatchObject({ status: 502 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("429 (limitation de débit) -> jamais retenté", async () => {
    const fetchMock = vi.fn().mockResolvedValue(httpError(429));
    vi.stubGlobal("fetch", fetchMock);

    await expect(performAliExpressSearch(PRODUCT_URL)).rejects.toMatchObject({ status: 502 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("401 (clé invalide) -> jamais retenté", async () => {
    const fetchMock = vi.fn().mockResolvedValue(httpError(401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(performAliExpressSearch(PRODUCT_URL)).rejects.toMatchObject({ status: 502 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("performAliExpressSearch — erreurs d'URL distinctes d'une absence de résultat", () => {
  beforeEach(() => {
    vi.stubEnv("FIRECRAWL_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    ["lien d'un autre site", "https://www.amazon.fr/dp/B0ABC"],
    ["lien AliExpress sans fiche produit", "https://fr.aliexpress.com/category/100003109/women-clothing.html"],
    ["lien raccourci", "https://a.aliexpress.com/_mABCdef"],
  ])("%s -> erreur 400, aucun appel fournisseur", async (_label, url) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(performAliExpressSearch(url)).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("performAliExpressSearch — chaîne de secours de la recherche par mot-clé", () => {
  const SEARCH_LINKS = `<a href="//fr.aliexpress.com/item/1005012690129627.html">x</a>`;
  const listingPage = `<html><body>${"x".repeat(2500)}${SEARCH_LINKS}</body></html>`;
  const productPage = fakeProductHtml({
    price: "11.19",
    offerName: "Chargeur induction 15W - Coloris blanc",
    shippingLine: "Livraison : 5,41 €",
    taxLine: "Droits de douane : 3,61 €",
  });

  /** Route les appels Firecrawl selon l'URL scrapée / l'endpoint. */
  function mockRouter(handlers: {
    prettySearch: () => string;
    altSearch: () => string;
    searchApi?: () => unknown;
  }) {
    const fetchMock = vi.fn(async (endpoint: string, init?: { body?: string }) => {
      const body = init?.body ? JSON.parse(init.body) : {};
      if (endpoint.endsWith("/v1/search")) {
        return {
          ok: true,
          status: 200,
          json: async () => handlers.searchApi?.() ?? { success: true, data: [] },
        };
      }
      const url: string = body.url;
      let rawHtml: string;
      if (url.includes("/item/")) rawHtml = productPage;
      else if (url.includes("/w/wholesale-")) rawHtml = handlers.prettySearch();
      else rawHtml = handlers.altSearch();
      return { ok: true, status: 200, json: async () => ({ success: true, data: { rawHtml } }) };
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  beforeEach(() => {
    vi.stubEnv("FIRECRAWL_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("page de résultats bloquée -> la variante stealth/mobile trouve l'annonce", async () => {
    const fetchMock = mockRouter({
      prettySearch: () => "Access Denied",
      altSearch: () => listingPage,
    });

    const result = await performAliExpressSearch("chargeur induction");
    expect(result.url).toBe(PRODUCT_URL);

    const altCall = fetchMock.mock.calls
      .map(([, init]) => JSON.parse((init as { body: string }).body))
      .find((b) => typeof b.url === "string" && b.url.includes("SearchText="));
    expect(altCall.proxy).toBe("stealth");
    expect(altCall.mobile).toBe(true);
    expect(altCall.headers["User-Agent"]).toBeTruthy();
  });

  it("toutes les pages de résultats bloquées -> le moteur Firecrawl /search fournit un vrai lien", async () => {
    mockRouter({
      prettySearch: () => "Access Denied",
      altSearch: () => "Access Denied",
      searchApi: () => ({ success: true, data: [{ url: PRODUCT_URL }] }),
    });

    const result = await performAliExpressSearch("chargeur induction");
    expect(result.url).toBe(PRODUCT_URL);
  });

  it("tout est bloqué et aucun secours ne répond -> 503 explicite, aucun résultat inventé", async () => {
    mockRouter({
      prettySearch: () => "Access Denied",
      altSearch: () => "Access Denied",
    });

    await expect(performAliExpressSearch("chargeur induction")).rejects.toMatchObject({
      status: 503,
    });
  });
});

describe("pickRotatingHeaders", () => {
  it("fait varier le User-Agent d'une rotation à l'autre", async () => {
    const { pickRotatingHeaders } = await import("./aliexpress-search");
    const agents = new Set([0, 1, 2, 3].map((i) => pickRotatingHeaders(i)["User-Agent"]));
    expect(agents.size).toBe(4);
  });
});
