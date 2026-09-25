"use client";

import { useId } from "react";

/**
 * Info-bulle accessible pour les termes techniques (ROI, marge, budget pub) :
 * bouton "?" ouvrant une bulle au survol (souris) ET au focus (clavier /
 * toucher sur mobile). `align="right"` ancre la bulle a droite pour les
 * elements proches du bord droit d'une carte.
 */
export function InfoTip({
  text,
  children,
  align = "left",
}: {
  text: string;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const id = useId();
  return (
    <span className="group/tip relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        aria-describedby={id}
        aria-label={`Explication : ${text}`}
        className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white/30 text-[9px] font-semibold leading-none text-white/60 transition-colors hover:border-cyan-300 hover:text-cyan-200 focus:outline-none focus-visible:border-cyan-300 focus-visible:text-cyan-200"
      >
        ?
      </button>
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none invisible absolute bottom-full z-50 mb-1.5 w-56 rounded-md border border-white/15 bg-[#0a0a14] px-2.5 py-2 text-left text-[11px] font-normal normal-case leading-snug tracking-normal text-white/85 opacity-0 shadow-lg transition-opacity group-focus-within/tip:visible group-focus-within/tip:opacity-100 group-hover/tip:visible group-hover/tip:opacity-100 ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {text}
      </span>
    </span>
  );
}

export const TIP_ROI =
  "Multiplicateur de rentabilité : ce que te rapporte chaque euro investi dans le produit.";
export const TIP_AD_BUDGET =
  "Montant maximum disponible pour ton budget publicitaire (TikTok, Meta) par vente avant d'être à perte.";
