import { describe, expect, it } from "vitest";

import {
  computeMarginEstimate,
  parseDecimalInput,
  reliabilityTierFromImportRatio,
  roundToPsychological,
} from "./margin-estimate";

describe("parseDecimalInput", () => {
  it("accepte un point comme séparateur décimal", () => {
    expect(parseDecimalInput("14.49")).toBe(14.49);
  });

  it("accepte une virgule comme séparateur décimal", () => {
    expect(parseDecimalInput("14,49")).toBe(14.49);
  });

  it("accepte un entier sans décimale", () => {
    expect(parseDecimalInput("10")).toBe(10);
  });

  it("accepte zéro (champ facultatif, ex. livraison gratuite)", () => {
    expect(parseDecimalInput("0")).toBe(0);
    expect(parseDecimalInput("0,00")).toBe(0);
  });

  // Bug confirmé en production : un texte invalide ne doit JAMAIS devenir
  // silencieusement 0 (ça gonflerait artificiellement la marge affichée).
  it("rejette une saisie non numérique (jamais silencieusement 0)", () => {
    expect(parseDecimalInput("abc")).toBeNull();
    expect(parseDecimalInput("12abc")).toBeNull();
    expect(parseDecimalInput("abc12")).toBeNull();
  });

  // Bug confirmé en production : un nombre négatif ne doit jamais devenir 0.
  it("rejette un nombre négatif (jamais silencieusement 0)", () => {
    expect(parseDecimalInput("-10")).toBeNull();
    expect(parseDecimalInput("-0.5")).toBeNull();
  });

  it("rejette une chaîne vide ou uniquement des espaces", () => {
    expect(parseDecimalInput("")).toBeNull();
    expect(parseDecimalInput("   ")).toBeNull();
  });

  it("rejette l'infini et les nombres mal formés", () => {
    expect(parseDecimalInput("Infinity")).toBeNull();
    expect(parseDecimalInput("1.2.3")).toBeNull();
  });
});

describe("roundToPsychological", () => {
  it("arrondit au 0,90 le plus proche", () => {
    expect(roundToPsychological(32.56)).toBeCloseTo(32.9, 5);
  });

  it("retourne 0 pour un prix nul ou négatif", () => {
    expect(roundToPsychological(0)).toBe(0);
    expect(roundToPsychological(-5)).toBe(0);
  });

  it("ne descend jamais sous 0,90 pour un prix strictement positif", () => {
    expect(roundToPsychological(0.5)).toBe(0.9);
  });
});

describe("reliabilityTierFromImportRatio", () => {
  it("retourne 'moyen' quand les frais d'import sont inconnus (null)", () => {
    expect(reliabilityTierFromImportRatio(null)).toBe("moyen");
  });

  it("retourne 'eleve' pour une faible part de frais d'import", () => {
    expect(reliabilityTierFromImportRatio(0.05)).toBe("eleve");
  });

  it("retourne 'moyen' pour une part intermédiaire", () => {
    expect(reliabilityTierFromImportRatio(0.2)).toBe("moyen");
  });

  it("retourne 'faible' pour une part élevée de frais d'import", () => {
    expect(reliabilityTierFromImportRatio(0.5)).toBe("faible");
  });
});

describe("computeMarginEstimate", () => {
  it("ne divise jamais par zéro : cout total nul -> tout est non calculable, pas 0 caché", () => {
    const estimate = computeMarginEstimate(0, null);
    expect(estimate.roiHigh).toBeNull();
    expect(estimate.roiLow).toBeNull();
    expect(estimate.reliability).toBeNull();
    expect(estimate.recommendedPrice).toBe(0);
  });

  it("calcule un ROI numérique quand le coût total est positif", () => {
    const estimate = computeMarginEstimate(18.09, 3.6);
    expect(estimate.roiHigh).not.toBeNull();
    expect(estimate.roiLow).not.toBeNull();
    expect(estimate.reliability).not.toBeNull();
  });

  it("prix conseillé = coût x 1,8 arrondi psychologique", () => {
    const estimate = computeMarginEstimate(18.09, null);
    expect(estimate.recommendedPrice).toBeCloseTo(roundToPsychological(18.09 * 1.8), 5);
  });

  it("marge = prix - coût, toujours définie même sans ROI calculable", () => {
    // Cas degenere theorique (jamais atteint depuis l'UI, qui valide les
    // entrees en amont) : verifie que la fonction elle-meme ne plante pas.
    const estimate = computeMarginEstimate(0.01, null);
    expect(estimate.marginHigh).toBeCloseTo(estimate.highPrice - 0.01, 5);
  });
});

import { computeSaleMetrics, roundCents } from "./margin-estimate";

describe("computeSaleMetrics", () => {
  it("distingue marge (€), taux de marge sur vente et ROI sur coût", () => {
    const m = computeSaleMetrics(18.09, 29.9);
    expect(m.marginBeforeAds).toBeCloseTo(11.81, 2);
    expect(m.marginRatePct).toBeCloseTo((11.81 / 29.9) * 100, 5);
    expect(m.roiPct).toBeCloseTo((11.81 / 18.09) * 100, 5);
  });

  it("le budget pub suit le prix de vente choisi, pas le prix haut", () => {
    const low = computeSaleMetrics(20, 30);
    const high = computeSaleMetrics(20, 46);
    expect(low.adBudgetMax).toBe(10);
    expect(high.adBudgetMax).toBe(26);
  });

  it("budget pub jamais négatif quand la marge est négative", () => {
    expect(computeSaleMetrics(30, 20).adBudgetMax).toBe(0);
  });

  it("prix de vente nul -> taux de marge non calculable (null), jamais 0 %", () => {
    expect(computeSaleMetrics(10, 0).marginRatePct).toBeNull();
  });

  it("coût nul -> ROI non calculable (null)", () => {
    expect(computeSaleMetrics(0, 10).roiPct).toBeNull();
  });

  it("roundCents évite les artefacts flottants", () => {
    expect(roundCents(0.1 + 0.2)).toBe(0.3);
  });
});
