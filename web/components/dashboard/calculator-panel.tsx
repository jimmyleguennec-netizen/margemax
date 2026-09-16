"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { computeMarginEstimate } from "@/lib/margin-estimate";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { CountUp } from "@/components/ui/count-up";

function parseEuro(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function formatEuro(n: number): string {
  return (
    n.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

function toInputValue(n: number): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPct(n: number): string {
  return (
    n.toLocaleString("fr-FR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " %"
  );
}

function NeonNumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0,00"
          className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-3 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
          €
        </span>
      </div>
    </div>
  );
}

function AnimatedNumber({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <motion.p
      key={value}
      initial={{ opacity: 0.3, scale: 0.95, filter: "brightness(1.8)" }}
      animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      {value}
    </motion.p>
  );
}

export function CalculatorPanel() {
  const [purchase, setPurchase] = useState("14,49");
  const [shipping, setShipping] = useState("0,00");
  const [importTax, setImportTax] = useState("3,60");
  const [salePrice, setSalePrice] = useState("29,90");

  const estimate = useMemo(() => {
    const p = parseEuro(purchase);
    const s = parseEuro(shipping);
    const t = parseEuro(importTax);
    const sale = parseEuro(salePrice);

    const totalCost = p + s + t;
    const margin = sale - totalCost;
    const marginPct = sale > 0 ? (margin / sale) * 100 : 0;
    const roiPct = totalCost > 0 ? (margin / totalCost) * 100 : 0;

    const priceEstimate = computeMarginEstimate(totalCost, t);

    return {
      totalCost,
      margin,
      marginPct,
      roiPct,
      ...priceEstimate,
    };
  }, [purchase, shipping, importTax, salePrice]);

  const isProfitable = estimate.margin > 0;
  const warnControls = useAnimation();
  const wasProfitable = useRef(isProfitable);

  useEffect(() => {
    if (!isProfitable && wasProfitable.current) {
      warnControls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.4 },
      });
    }
    wasProfitable.current = isProfitable;
  }, [isProfitable, warnControls]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
        <h2 className="text-lg font-semibold text-white">
          Calculateur de marge
        </h2>
        <p className="mt-1 mb-6 text-sm text-white/40">
          Renseignez vos propres coûts -- le calcul et les estimations se
          mettent à jour en direct.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NeonNumberField
            id="calc-purchase"
            label="Prix d'achat"
            value={purchase}
            onChange={setPurchase}
          />
          <NeonNumberField
            id="calc-shipping"
            label="Frais de livraison"
            value={shipping}
            onChange={setShipping}
          />
          <NeonNumberField
            id="calc-import"
            label="Frais d'importation / TVA"
            value={importTax}
            onChange={setImportTax}
          />
          <NeonNumberField
            id="calc-sale"
            label="Prix de vente (manuel)"
            value={salePrice}
            onChange={setSalePrice}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSalePrice(toInputValue(estimate.lowPrice))}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-pink-400/40 hover:text-white hover:shadow-[0_0_14px_-4px_rgba(244,114,182,0.5)]"
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Appliquer Marge Basse
          </button>
          <button
            type="button"
            onClick={() => setSalePrice(toInputValue(estimate.highPrice))}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-cyan-400/40 hover:text-white hover:shadow-[0_0_14px_-4px_rgba(34,211,238,0.5)]"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Appliquer Marge Haute
          </button>
        </div>

        {/* Resultat du prix de vente manuel */}
        <motion.div
          animate={warnControls}
          className={`mt-6 grid grid-cols-2 gap-4 rounded-xl border p-5 transition-colors duration-300 sm:grid-cols-4 ${
            isProfitable
              ? "border-white/10 bg-white/[0.02]"
              : "animate-pulse border-pink-500/40 bg-pink-500/[0.04] shadow-[0_0_24px_-6px_rgba(244,63,94,0.5)]"
          }`}
        >
          <div>
            <p className="text-xs text-white/40">Coût total</p>
            <AnimatedNumber
              value={formatEuro(estimate.totalCost)}
              className="mt-1 text-lg font-bold text-white"
            />
          </div>
          <div>
            <p className="text-xs text-white/40">Marge nette</p>
            <AnimatedNumber
              value={formatEuro(estimate.margin)}
              className={`mt-1 text-lg font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.6)] ${
                isProfitable ? "text-cyan-300" : "text-pink-400"
              }`}
            />
          </div>
          <div>
            <p className="text-xs text-white/40">Marge %</p>
            <AnimatedNumber
              value={formatPct(estimate.marginPct)}
              className="mt-1 text-lg font-bold text-white"
            />
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-white/40">
              <TrendingUp className="h-3 w-3" /> ROI
            </p>
            <AnimatedNumber
              value={formatPct(estimate.roiPct)}
              className="mt-1 text-lg font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]"
            />
          </div>
        </motion.div>

        {!isProfitable && (
          <p className="mt-3 text-center text-xs text-pink-300">
            Marge négative avec ces chiffres -- augmentez le prix de vente ou
            réduisez les coûts.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/[0.05] px-4 py-2.5 text-sm">
          <span className="text-white/50">CPA Max Pub (budget TikTok/Meta max par vente)</span>
          <span
            className={`font-bold drop-shadow-[0_0_8px_rgba(217,70,239,0.6)] ${
              isProfitable ? "text-fuchsia-300" : "text-pink-400"
            }`}
          >
            {formatEuro(Math.max(0, estimate.margin))}
          </span>
        </div>

        {/* Bloc 1 : Couts reels */}
        <div className="mt-8">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-cyan-200/70">
            Bloc 1 -- Coûts réels
          </h3>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
            <div className="flex items-center justify-between text-white/50">
              <span>Prix produit</span>
              <span className="font-medium text-white">
                {formatEuro(parseEuro(purchase))}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-white/50">
              <span>Livraison</span>
              <span className="font-medium text-white">
                {formatEuro(parseEuro(shipping))}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-white/50">
              <span>Taxes / import</span>
              <span className="font-medium text-white">
                {formatEuro(parseEuro(importTax))}
              </span>
            </div>
            <div className="my-2 h-px bg-white/10" />
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Coût total</span>
              <AnimatedNumber
                value={formatEuro(estimate.totalCost)}
                className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              />
            </div>
          </div>
        </div>

        {/* Bloc 2 : Estimations & Marges */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-cyan-200/70">
            Bloc 2 -- Estimations &amp; Marges
          </h3>

          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-white/40">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Prix de vente recommandé estimé
                </p>
                <p className="mt-1 text-2xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]">
                  <CountUp value={estimate.recommendedPrice} format={formatEuro} />
                </p>
              </div>
              <CircularGauge value={estimate.reliability} size={64} strokeWidth={5} label="fiabilité" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="flex items-center gap-1.5 text-xs text-white/40">
                  <TrendingDown className="h-3.5 w-3.5 text-pink-300" />
                  Marge basse (fourchette prudente)
                </p>
                <AnimatedNumber
                  value={formatEuro(estimate.lowPrice)}
                  className="mt-1 text-lg font-bold text-white"
                />
                <p className="mt-1 text-xs text-white/40">
                  Marge {formatEuro(estimate.marginLow)} ·{" "}
                  {formatPct(estimate.roiLow)} ROI
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="flex items-center gap-1.5 text-xs text-white/40">
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-300" />
                  Marge haute (fourchette premium)
                </p>
                <AnimatedNumber
                  value={formatEuro(estimate.highPrice)}
                  className="mt-1 text-lg font-bold text-white"
                />
                <p className="mt-1 text-xs text-white/40">
                  Marge {formatEuro(estimate.marginHigh)} ·{" "}
                  {formatPct(estimate.roiHigh)} ROI
                </p>
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] text-white/30">
              Estimation calculée à partir de vos coûts réels -- pas une
              donnée de marché garantie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
