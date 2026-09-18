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

  it("résultat incomplet : livraison introuvable -> shippingStatus=missing, shipping jamais remplacé par 0, total null", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "11.19",
        // Pas de ligne de livraison du tout.
        taxLine: "Droits de douane : 3,61 €",
        offerName: "Variante A",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);

    expect(result.shippingStatus).toBe("missing");
    expect(result.shipping).toBeNull(); // jamais 0 à la place de null
    expect(result.isComplete).toBe(false);
    expect(result.total).toBeNull(); // jamais affiché comme "Coût total" complet
    // Le cout partiel reste calculable (livraison comptée pour 0 dans CE calcul là uniquement).
    expect(result.partialTotal).toBeCloseTo(11.19 + 0 + 3.61, 5);
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
    // 11.19 * 0.20 = 2.238 -> arrondi à 2,24 €.
    expect(result.importFee).toBeCloseTo(2.24, 5);
    expect(result.isComplete).toBe(false);
    expect(result.total).toBeNull();
  });

  it("arrondi de l'estimation TVA au centime le plus proche", async () => {
    mockFirecrawlSuccess(
      fakeProductHtml({
        price: "14.995",
        shippingLine: "Livraison : 1,00 €",
      })
    );

    const result = await performAliExpressSearch(PRODUCT_URL);
    // 14.995 * 0.20 = 2.999 -> arrondi à 3,00 €.
    expect(result.importFee).toBeCloseTo(3.0, 5);
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
