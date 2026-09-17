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

export interface PackCombinationItem {
  pack: Pack;
  quantity: number;
}

/**
 * Combinaison de packs reellement achetable couvrant un volume superieur
 * a MAX_PACK_CREDITS. Glouton : prend a chaque etape le plus grand pack
 * dont les credits tiennent dans le besoin restant ; si aucun pack ne
 * tient (reste < plus petit pack), prend le plus petit pack pour couvrir
 * le reste (leger surplus plutot que de ne jamais atteindre le besoin).
 * Verifie sur le cas donne : 220 -> Ultimate(200) + Essentiel(15) +
 * Starter(5) = 220 credits / 70,97 €, exactement.
 */
export function recommendPackCombinationForVolume(volume: number): {
  items: PackCombinationItem[];
  totalCredits: number;
  totalPrice: number;
} {
  const sortedDesc = [...PACKS].sort((a, b) => b.credits - a.credits);
  const smallest = sortedDesc[sortedDesc.length - 1];

  const items: PackCombinationItem[] = [];
  let remaining = volume;
  let iterations = 0;

  while (remaining > 0 && iterations < 100) {
    iterations += 1;
    const fitting = sortedDesc.find((pack) => pack.credits <= remaining);
    const chosen = fitting ?? smallest;

    const existing = items.find((item) => item.pack.key === chosen.key);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ pack: chosen, quantity: 1 });
    }
    remaining -= chosen.credits;
  }

  const totalCredits = items.reduce(
    (sum, item) => sum + item.pack.credits * item.quantity,
    0
  );
  const totalPrice = items.reduce(
    (sum, item) => sum + item.pack.priceEuros * item.quantity,
    0
  );

  return { items, totalCredits, totalPrice };
}
