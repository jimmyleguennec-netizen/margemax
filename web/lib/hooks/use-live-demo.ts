"use client";

import { useEffect, useState } from "react";

import { computeMarginEstimate, computeSaleMetrics } from "@/lib/margin-estimate";

/** Sous-ensemble de la reponse de /api/demo utilise par les demos de la
 * landing (voir app/api/demo/route.ts : analyse reelle, mise en cache 1 h). */
export type LiveDemo = {
  title: string;
  url: string;
  subtotal: number | null;
  shipping: number | null;
  shippingStatus: "confirmed" | "estimated" | "missing";
  importFee: number | null;
  importFeeStatus: "confirmed" | "estimated" | "missing";
  partialTotal: number;
  isComplete: boolean;
  variantStatus: "confirmed" | "estimated" | "missing";
  rating: number | null;
  reviewCount: number | null;
  analyzedAt: string;
};

type State =
  | { status: "loading"; data: null }
  | { status: "ready"; data: LiveDemo }
  | { status: "error"; data: null };

// Une seule requete par chargement de page, partagee entre toutes les demos
// (Demo et InteractiveDemo) -- et c'est le cache 1 h de /api/demo (memoire +
// CDN) qui evite tout scrape Firecrawl supplementaire.
let pending: Promise<LiveDemo> | null = null;

function fetchLiveDemo(): Promise<LiveDemo> {
  pending ??= fetch("/api/demo")
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? `HTTP ${response.status}`);
      return data as LiveDemo;
    })
    .catch((err) => {
      // Permet une nouvelle tentative au prochain montage.
      pending = null;
      throw err;
    });
  return pending;
}

export function useLiveDemo(): State {
  const [state, setState] = useState<State>({ status: "loading", data: null });

  useEffect(() => {
    let active = true;
    fetchLiveDemo()
      .then((data) => active && setState({ status: "ready", data }))
      .catch((err) => {
        console.error("[useLiveDemo] Exemple en direct indisponible :", err);
        if (active) setState({ status: "error", data: null });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}


/** Chiffres derives de l'exemple en direct : memes fonctions de calcul que
 * le dashboard (jamais de marge/ROI recopies a la main). */
export function demoMetrics(demo: LiveDemo) {
  const subtotal = demo.subtotal ?? 0;
  const shipping = demo.shipping ?? 0;
  const importFee = demo.importFee ?? 0;
  const totalCost = demo.partialTotal;
  const estimate = computeMarginEstimate(totalCost, demo.importFee);
  // Marge/ROI au prix de vente CONSEILLE (celui retenu par defaut au dashboard).
  const sale = computeSaleMetrics(totalCost, estimate.recommendedPrice);
  return { subtotal, shipping, importFee, totalCost, estimate, sale };
}

/** "Verifie" seulement si tout est confirme -- meme regle que le dashboard. */
export function isDemoVerified(demo: LiveDemo): boolean {
  return demo.isComplete && demo.variantStatus === "confirmed";
}
