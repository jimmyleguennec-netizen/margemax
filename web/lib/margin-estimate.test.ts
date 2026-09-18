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
