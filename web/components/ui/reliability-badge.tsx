import type { ReliabilityTier } from "@/lib/margin-estimate";

const TIER_CONFIG: Record<ReliabilityTier, { label: string; className: string }> = {
  eleve: {
    label: "Fiabilité élevée",
    className: "border-green-400/30 bg-green-400/10 text-green-300",
  },
  moyen: {
    label: "Fiabilité moyenne",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  faible: {
    label: "Fiabilité faible",
    className: "border-pink-400/30 bg-pink-400/10 text-pink-300",
  },
};

/**
 * Palier qualitatif (pas un pourcentage precis, voir
 * reliabilityTierFromImportRatio dans lib/margin-estimate.ts). tier=null
 * (cout total non calculable) affiche un badge neutre plutot que rien.
 */
export function ReliabilityBadge({ tier }: { tier: ReliabilityTier | null }) {
  if (!tier) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/40">
        Fiabilité non calculable
      </span>
    );
  }

  const config = TIER_CONFIG[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
