/**
 * Source unique de verite pour les packs de credits -- utilisee par le
 * selecteur (credit-calculator.tsx), les cartes de tarifs (pricing.tsx)
 * et, plus tard, toute validation cote serveur (webhook Stripe). Aucun
 * prix ni prix/credit ne doit etre recopie/arrondi a la main ailleurs :
 * les ecarts constates (ex. 0,42 au lieu de 0,43 pour le pack Avance)
 * venaient exactement de ca.
 */
export type PackKey = "starter" | "essentiel" | "avance" | "pro" | "ultimate";

export interface Pack {
  key: PackKey;
  label: string;
  credits: number;
  priceEuros: number;
}

export const PACKS: Pack[] = [
  { key: "starter", label: "Starter", credits: 5, priceEuros: 2.99 },
  { key: "essentiel", label: "Essentiel", credits: 15, priceEuros: 7.99 },
  { key: "avance", label: "Avancé", credits: 35, priceEuros: 14.99 },
  { key: "pro", label: "Pro", credits: 80, priceEuros: 29.99 },
  { key: "ultimate", label: "Ultimate", credits: 200, priceEuros: 59.99 },
];

export const MAX_PACK_CREDITS = Math.max(...PACKS.map((p) => p.credits));

export function formatEuro(n: number): string {
  return (
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
    " €"
  );
}

export function pricePerCredit(pack: Pack): number {
  return pack.priceEuros / pack.credits;
}

export function formatPricePerCredit(pack: Pack): string {
  return `${formatEuro(pricePerCredit(pack))}/crédit`;
}

/**
 * Pack le plus adapte a un volume donne. Si aucun pack seul ne couvre le
 * volume (au-dela de MAX_PACK_CREDITS), renvoie le plus grand pack avec
 * `coversVolume: false` -- ne jamais affirmer qu'il couvre un besoin
 * superieur a sa propre capacite.
 */
export function recommendPackForVolume(volume: number): {
  pack: Pack;
  coversVolume: boolean;
} {
  const match = PACKS.find((pack) => volume <= pack.credits);
  if (match) return { pack: match, coversVolume: true };
  return { pack: PACKS[PACKS.length - 1], coversVolume: false };
}
