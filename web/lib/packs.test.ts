import { describe, expect, it } from "vitest";

import {
  MAX_PACK_CREDITS,
  PACKS,
  pricePerCredit,
  recommendPackCombinationForVolume,
  recommendPackForVolume,
} from "./packs";

describe("PACKS — source unique de vérité", () => {
  it("expose exactement les cinq packs attendus (clé, crédits, prix)", () => {
    expect(PACKS).toEqual([
      { key: "starter", label: "Starter", credits: 5, priceEuros: 2.99 },
      { key: "essentiel", label: "Essentiel", credits: 15, priceEuros: 7.99 },
      { key: "avance", label: "Avancé", credits: 35, priceEuros: 14.99 },
      { key: "pro", label: "Pro", credits: 80, priceEuros: 29.99 },
      { key: "ultimate", label: "Ultimate", credits: 200, priceEuros: 59.99 },
    ]);
  });

  it("chaque pack a un prix par crédit strictement positif et fini", () => {
    for (const pack of PACKS) {
      const ppc = pricePerCredit(pack);
      expect(ppc).toBeGreaterThan(0);
      expect(Number.isFinite(ppc)).toBe(true);
    }
  });
});

describe("recommendPackForVolume — limites", () => {
  it("volume exactement égal aux crédits d'un pack -> ce pack couvre (limite basse)", () => {
    const { pack, coversVolume } = recommendPackForVolume(5);
    expect(pack.key).toBe("starter");
    expect(coversVolume).toBe(true);
  });

  it("volume juste au-dessus des crédits d'un pack -> passe au pack suivant", () => {
    const { pack, coversVolume } = recommendPackForVolume(6);
    expect(pack.key).toBe("essentiel");
    expect(coversVolume).toBe(true);
  });

  it("volume exactement égal à MAX_PACK_CREDITS -> le plus grand pack couvre", () => {
    const { pack, coversVolume } = recommendPackForVolume(MAX_PACK_CREDITS);
    expect(pack.key).toBe("ultimate");
    expect(coversVolume).toBe(true);
  });

  it("volume au-delà de MAX_PACK_CREDITS -> plus grand pack renvoyé, mais coversVolume=false (jamais affirmer une couverture fausse)", () => {
    const { pack, coversVolume } = recommendPackForVolume(MAX_PACK_CREDITS + 1);
    expect(pack.key).toBe("ultimate");
    expect(coversVolume).toBe(false);
  });

  it("volume nul -> le plus petit pack couvre déjà (0 <= 5)", () => {
    const { pack, coversVolume } = recommendPackForVolume(0);
    expect(pack.key).toBe("starter");
    expect(coversVolume).toBe(true);
  });
});

describe("recommendPackCombinationForVolume — limites", () => {
  it("cas documenté : 220 crédits -> Ultimate(200) + Essentiel(15) + Starter(5), 70,97 €", () => {
    const { items, totalCredits, totalPrice } = recommendPackCombinationForVolume(220);
    expect(totalCredits).toBe(220);
    expect(totalPrice).toBeCloseTo(59.99 + 7.99 + 2.99, 5);

    const byKey = Object.fromEntries(items.map((i) => [i.pack.key, i.quantity]));
    expect(byKey.ultimate).toBe(1);
    expect(byKey.essentiel).toBe(1);
    expect(byKey.starter).toBe(1);
  });

  it("la combinaison ne descend jamais sous le volume demandé", () => {
    for (const volume of [1, 5, 6, 34, 201, 999]) {
      const { totalCredits } = recommendPackCombinationForVolume(volume);
      expect(totalCredits).toBeGreaterThanOrEqual(volume);
    }
  });

  it("volume nul -> aucun pack recommandé, aucune boucle infinie", () => {
    const { items, totalCredits, totalPrice } = recommendPackCombinationForVolume(0);
    expect(items).toHaveLength(0);
    expect(totalCredits).toBe(0);
    expect(totalPrice).toBe(0);
  });

  it("gros volume (bien au-delà d'un seul pack) reste borné et termine (pas de boucle infinie)", () => {
    const { totalCredits } = recommendPackCombinationForVolume(10_000);
    expect(totalCredits).toBeGreaterThanOrEqual(10_000);
  });
});
