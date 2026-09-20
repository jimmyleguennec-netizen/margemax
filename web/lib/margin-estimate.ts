// Formules d'estimation de prix partagees entre le Calculateur de marge
// (couts saisis manuellement) et la carte de resultat de recherche (couts
// reels extraits par /api/search) -- evite que les deux endroits divergent.
//
// Module purement synchrone/sans effet de bord : toute validation de
// saisie et tout calcul de marge/ROI/arrondi de prix doivent passer par
// ici plutot que d'etre recopies dans un composant.

export type ReliabilityTier = "eleve" | "moyen" | "faible";

export type MarginEstimate = {
  recommendedPrice: number;
  highPrice: number;
  lowPrice: number;
  marginHigh: number;
  /** null = non calculable (cout total nul, division par zero evitee). */
  roiHigh: number | null;
  marginLow: number;
  roiLow: number | null;
  /** null = non calculable (cout total nul). Sinon un palier qualitatif,
   * pas un pourcentage precis -- voir reliabilityTierFromImportRatio(). */
  reliability: ReliabilityTier | null;
};

/**
 * Parse une saisie utilisateur (virgule OU point comme separateur
 * decimal) en nombre fini et positif ou nul. Retourne null pour TOUTE
 * saisie invalide (texte, nombre negatif, infini, chaine vide) -- jamais
 * silencieusement 0, pour qu'un "abc" ou un "-10" ne se transforme pas en
 * cout nul qui gonflerait artificiellement la marge affichee.
 */
export function parseDecimalInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(",", ".");
  // Rejette explicitement toute saisie qui n'est pas ENTIEREMENT un
  // nombre decimal (ex. "12abc", "1.2.3") -- Number() est trop permissif
  // sur les chaines vides/espaces et Number.parseFloat("12abc") vaudrait
  // 12 en ignorant silencieusement le reste.
  if (!/^-?\d+([.,]\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

// Arrondi psychologique (ex: 32,56 -> 32,90) pour les prix suggeres.
export function roundToPsychological(price: number): number {
  if (price <= 0) return 0;
  return Math.max(0.9, Math.round(price) - 0.1);
}

/**
 * Fiabilite QUALITATIVE (pas un pourcentage precis -- l'ancien score
 * "97 - importRatio*35 borne 60-99" affichait une precision a l'unite
 * pres injustifiable pour une heuristique) basee sur la part des frais
 * d'importation dans le cout total : plus cette part est grande, plus le
 * cout total depend d'un composant variable/sujet a estimation (droits de
 * douane, qui fluctuent et sont parfois mal extraits), donc moins fiable.
 * importRatio null (frais d'import jamais extraits/saisis) => palier
 * "moyen" par defaut, ni optimiste ni pessimiste faute de donnee.
 */
export function reliabilityTierFromImportRatio(
  importRatio: number | null
): ReliabilityTier {
  if (importRatio === null) return "moyen";
  if (importRatio < 0.15) return "eleve";
  if (importRatio < 0.35) return "moyen";
  return "faible";
}

/**
 * Estimation de prix de vente et de marge a partir du cout total reel
 * (ou saisi) d'un produit. Purement heuristique -- pas une donnee de
 * marche garantie, voir le texte affiche a cote de ce bloc dans l'UI.
 * Methode : prix bas = cout x 1,5, prix conseille = cout x 1,8, prix haut
 * = cout x 2,3, chacun arrondi au 0,90 psychologique le plus proche
 * (roundToPsychological) -- coefficients fixes, pas de donnee de marche
 * externe.
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
      roiHigh: null,
      marginLow: 0,
      roiLow: null,
      reliability: null,
    };
  }

  const recommendedPrice = roundToPsychological(totalCost * 1.8);
  const highPrice = roundToPsychological(totalCost * 2.3);
  const lowPrice = roundToPsychological(totalCost * 1.5);

  const marginHigh = highPrice - totalCost;
  const roiHigh = (marginHigh / totalCost) * 100;
  const marginLow = lowPrice - totalCost;
  const roiLow = (marginLow / totalCost) * 100;

  const importRatio = importFee !== null ? importFee / totalCost : null;
  const reliability = reliabilityTierFromImportRatio(importRatio);

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

/** Arrondi au centime -- evite les artefacts flottants (0,1 + 0,2) dans les
 * totaux et marges affiches. */
export function roundCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export type SaleMetrics = {
  /** Prix de vente sur lequel TOUT ce qui suit est calcule. */
  salePrice: number;
  /** vente - cout, AVANT publicite, frais de transaction et impots. */
  marginBeforeAds: number;
  /** Taux de marge SUR LA VENTE (marge / prix de vente, en %) ; null si le
   * prix de vente est nul (denominateur nul -> "Non calculable"). */
  marginRatePct: number | null;
  /** ROI SUR LE COUT (marge / cout, en %) ; null si le cout est nul. */
  roiPct: number | null;
  /** Budget pub maximum par vente = marge avant pub, jamais negatif. */
  adBudgetMax: number;
};

/**
 * Source unique des trois grandeurs qu'on confondait : marge (en €),
 * taux de marge sur vente et ROI sur cout, plus le budget pub -- tous
 * calcules sur le prix de vente REELLEMENT retenu (saisi ou selectionne),
 * jamais sur le prix haut par defaut. Partage par le Calculateur et la
 * carte de resultat de recherche.
 */
export function computeSaleMetrics(totalCost: number, salePrice: number): SaleMetrics {
  const cost = roundCents(totalCost);
  const sale = roundCents(salePrice);
  const margin = roundCents(sale - cost);
  return {
    salePrice: sale,
    marginBeforeAds: margin,
    marginRatePct: sale > 0 ? (margin / sale) * 100 : null,
    roiPct: cost > 0 ? (margin / cost) * 100 : null,
    adBudgetMax: Math.max(0, margin),
  };
}
