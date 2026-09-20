"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

import {
  computeMarginEstimate,
  computeSaleMetrics,
  parseDecimalInput,
  roundCents,
} from "@/lib/margin-estimate";
import { ReliabilityBadge } from "@/components/ui/reliability-badge";
import { CountUp } from "@/components/ui/count-up";

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

/** null (non calculable, denominateur nul) -> "Non calculable", jamais 0 %. */
function formatPct(n: number | null): string {
  if (n === null) return "Non calculable";
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
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
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
          aria-invalid={invalid}
          className={`w-full rounded-lg border bg-white/5 py-2.5 pl-3 pr-10 text-sm text-white placeholder:text-white/50 outline-none transition-all ${
            invalid
              ? "border-pink-500/60 shadow-[0_0_20px_-2px_rgba(244,63,94,0.6)]"
              : "border-cyan-400/20 focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
          }`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50">
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

  const parsed = useMemo(
    () => ({
      p: parseDecimalInput(purchase),
      s: parseDecimalInput(shipping),
      t: parseDecimalInput(importTax),
      sale: parseDecimalInput(salePrice),
    }),
    [purchase, shipping, importTax, salePrice]
  );

  // Une saisie invalide (texte, negatif, vide) suspend TOUT le bloc de
  // resultats plutot que de la convertir silencieusement en 0 -- un "abc"
  // ou un "-10" dans le prix d'achat ne doit jamais artificiellement
  // gonfler la marge affichee.
  const invalidFields = {
    purchase: parsed.p === null,
    shipping: parsed.s === null,
    importTax: parsed.t === null,
    salePrice: parsed.sale === null,
  };
  const hasInvalidInput = Object.values(invalidFields).some(Boolean);

  const estimate = useMemo(() => {
    if (parsed.p === null || parsed.s === null || parsed.t === null || parsed.sale === null) {
      return null;
    }

    const totalCost = roundCents(parsed.p + parsed.s + parsed.t);
    // Marge, taux de marge sur vente, ROI sur cout et budget pub : formules
    // centralisees (lib/margin-estimate.ts), calculees sur le prix de vente
    // SAISI, denominateur nul -> null ("Non calculable").
    const metrics = computeSaleMetrics(totalCost, parsed.sale);
    const margin = metrics.marginBeforeAds;
    const marginPct = metrics.marginRatePct;
    const roiPct = metrics.roiPct;
    const adBudgetMax = metrics.adBudgetMax;

    const priceEstimate = computeMarginEstimate(totalCost, parsed.t);

    return {
      totalCost,
      margin,
      marginPct,
      roiPct,
      adBudgetMax,
      ...priceEstimate,
    };
  }, [parsed]);

  const isProfitable = (estimate?.margin ?? 0) > 0;
  const warnControls = useAnimation();
  const wasProfitable = useRef(isProfitable);

  useEffect(() => {
    if (estimate && !isProfitable && wasProfitable.current) {
      warnControls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.4 },
      });
    }
    wasProfitable.current = isProfitable;
  }, [isProfitable, warnControls, estimate]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 lg:max-w-5xl">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
        <h2 className="text-lg font-semibold text-white">
          Calculateur de marge
        </h2>
        <p className="mt-1 mb-6 text-sm text-white/60">
          Renseigne tes propres coûts — le calcul et les estimations se
          mettent à jour en direct.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NeonNumberField
            id="calc-purchase"
            label="Prix d'achat"
            value={purchase}
            onChange={setPurchase}
            invalid={invalidFields.purchase}
          />
          <NeonNumberField
            id="calc-shipping"
            label="Frais de livraison"
            value={shipping}
            onChange={setShipping}
            invalid={invalidFields.shipping}
          />
          <NeonNumberField
            id="calc-import"
            label="Frais d'importation / TVA"
            value={importTax}
            onChange={setImportTax}
            invalid={invalidFields.importTax}
          />
          <NeonNumberField
            id="calc-sale"
            label="Prix de vente (manuel)"
            value={salePrice}
            onChange={setSalePrice}
            invalid={invalidFields.salePrice}
          />
        </div>

        {hasInvalidInput && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-pink-400/30 bg-pink-400/10 p-3 text-xs text-pink-200">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Saisis des nombres valides et positifs ou nuls (virgule ou
            point accepté comme séparateur décimal) dans tous les champs
            pour voir les résultats.
          </p>
        )}

        {/* Resultats -- suspendus (non rendus) tant qu'une saisie est
            invalide, voir hasInvalidInput ci-dessus. Couts a gauche, marge
            a droite sur grand ecran ; empiles sur mobile. */}
        {estimate && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* GAUCHE : Tes coûts */}
            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-cyan-200/70">
                Tes coûts
              </h3>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm glow-hover-sm">
                <div className="flex items-center justify-between text-white/70">
                  <span>Prix produit</span>
                  <span className="font-medium text-white">
                    {formatEuro(parsed.p ?? 0)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-white/70">
                  <span>Livraison</span>
                  <span className="font-medium text-white">
                    {formatEuro(parsed.s ?? 0)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-white/70">
                  <span>Taxes / import</span>
                  <span className="font-medium text-white">
                    {formatEuro(parsed.t ?? 0)}
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

            {/* DROITE : Ta marge estimée */}
            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-cyan-200/70">
                Ta marge estimée
              </h3>

              <motion.div
                animate={warnControls}
                className={`grid grid-cols-3 gap-2 rounded-xl border p-3 text-sm transition-colors duration-300 sm:gap-4 sm:p-4 ${
                  isProfitable
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-pink-500/40 bg-pink-500/[0.04] shadow-[0_0_24px_-6px_rgba(244,63,94,0.5)]"
                }`}
              >
                <div>
                  <p className="text-xs text-white/60">Marge avant pub</p>
                  <AnimatedNumber
                    value={formatEuro(estimate.margin)}
                    className={`mt-1 text-lg font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.6)] ${
                      isProfitable ? "text-cyan-300" : "text-pink-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs text-white/60">Taux de marge (sur vente)</p>
                  <AnimatedNumber
                    value={formatPct(estimate.marginPct)}
                    className="mt-1 text-lg font-bold text-white"
                  />
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-white/60">
                    <TrendingUp aria-hidden="true" className="h-3 w-3" /> ROI (sur coût)
                  </p>
                  <AnimatedNumber
                    value={formatPct(estimate.roiPct)}
                    className="mt-1 text-lg font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]"
                  />
                </div>
              </motion.div>

              {!isProfitable && (
                <p className="mt-3 text-center text-xs text-pink-300">
                  Marge négative avec ces chiffres — augmente le prix de
                  vente ou réduis les coûts.
                </p>
              )}

              <div className="mt-3 rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/[0.05] px-4 py-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Budget pub maximum par vente (TikTok/Meta)</span>
                  <span
                    className={`font-bold drop-shadow-[0_0_8px_rgba(217,70,239,0.6)] ${
                      isProfitable ? "text-fuchsia-300" : "text-pink-400"
                    }`}
                  >
                    {formatEuro(estimate.adBudgetMax)}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-white/60">
                  Ne déduit ni frais de transaction (Stripe, PayPal...), ni
                  commissions publicitaires, ni impôts sur le profit — à
                  soustraire toi-même avant de fixer un budget réel.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSalePrice(toInputValue(estimate.lowPrice))}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-pink-400/40 hover:text-white hover:shadow-[0_0_14px_-4px_rgba(244,114,182,0.5)]"
                >
                  <TrendingDown aria-hidden="true" className="h-3.5 w-3.5" />
                  Appliquer prix de vente bas
                </button>
                <button
                  type="button"
                  onClick={() => setSalePrice(toInputValue(estimate.highPrice))}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-cyan-400/40 hover:text-white hover:shadow-[0_0_14px_-4px_rgba(34,211,238,0.5)]"
                >
                  <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />
                  Appliquer prix de vente haut
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
                <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-white/60">
                      Prix de vente recommandé estimé
                    </p>
                    <p className="mt-1 text-2xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]">
                      <CountUp value={estimate.recommendedPrice} format={formatEuro} />
                    </p>
                  </div>
                  <ReliabilityBadge tier={estimate.reliability} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 glow-hover">
                    <p className="flex items-center gap-1.5 text-xs text-white/60">
                      <TrendingDown aria-hidden="true" className="h-3.5 w-3.5 text-pink-300" />
                      Prix de vente bas (fourchette prudente)
                    </p>
                    <AnimatedNumber
                      value={formatEuro(estimate.lowPrice)}
                      className="mt-1 text-lg font-bold text-white"
                    />
                    <p className="mt-1 text-xs text-white/60">
                      Marge {formatEuro(estimate.marginLow)} ·{" "}
                      {formatPct(estimate.roiLow)} ROI
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 glow-hover">
                    <p className="flex items-center gap-1.5 text-xs text-white/60">
                      <TrendingUp aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
                      Prix de vente haut (fourchette premium)
                    </p>
                    <AnimatedNumber
                      value={formatEuro(estimate.highPrice)}
                      className="mt-1 text-lg font-bold text-white"
                    />
                    <p className="mt-1 text-xs text-white/60">
                      Marge {formatEuro(estimate.marginHigh)} ·{" "}
                      {formatPct(estimate.roiHigh)} ROI
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-center text-[11px] text-white/60">
                  Méthode : prix bas = coût × 1,5, prix conseillé = coût ×
                  1,8, prix haut = coût × 2,3, arrondis au 0,90 €
                  psychologique le plus proche — coefficients fixes, pas
                  une donnée de marché. La fiabilité est qualitative, pas
                  un pourcentage : elle diminue quand les frais
                  d&apos;importation pèsent lourd dans le coût total.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
