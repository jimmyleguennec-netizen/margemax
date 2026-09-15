// Formules d'estimation de prix partagees entre le Calculateur de marge
// (couts saisis manuellement) et la carte de resultat de recherche (couts
// reels extraits par /api/search) -- evite que les deux endroits divergent.

export type MarginEstimate = {
  recommendedPrice: number;
  highPrice: number;
  lowPrice: number;
  marginHigh: number;
  roiHigh: number;
  marginLow: number;
  roiLow: number;
  reliability: number;
};

// Arrondi psychologique (ex: 32,56 -> 32,90) pour les prix suggeres.
export function roundToPsychological(price: number): number {
  if (price <= 0) return 0;
  return Math.max(0.9, Math.round(price) - 0.1);
}

/**
 * Estimation de prix de vente et de marge a partir du cout total reel
 * (ou saisi) d'un produit. Purement heuristique -- pas une donnee de
 * marche garantie, voir le texte affiche a cote de ce bloc dans l'UI.
 */
export function computeMarginEstimate(
  totalCost: number,
  importFee: number | null
): MarginEstimate {
  if (totalCost <= 0) {
    return {
      recommendedPrice: 0,
      highPrice: 0,
      lowPrice: 0,
      marginHigh: 0,
      roiHigh: 0,
      marginLow: 0,
      roiLow: 0,
      reliability: 0,
    };
  }

  const recommendedPrice = roundToPsychological(totalCost * 1.8);
  const highPrice = roundToPsychological(totalCost * 2.3);
  const lowPrice = roundToPsychological(totalCost * 1.5);

  const marginHigh = highPrice - totalCost;
  const roiHigh = (marginHigh / totalCost) * 100;
  const marginLow = lowPrice - totalCost;
  const roiLow = (marginLow / totalCost) * 100;

  const importRatio = importFee !== null ? importFee / totalCost : 0;
  const reliability = Math.min(
    99,
    Math.max(60, Math.round(97 - importRatio * 35))
  );

  return {
    recommendedPrice,
    highPrice,
    lowPrice,
    marginHigh,
    roiHigh,
    marginLow,
    roiLow,
    reliability,
  };
}
