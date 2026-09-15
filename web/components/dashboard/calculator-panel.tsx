"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function parseEuro(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatPct(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
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

export function CalculatorPanel() {
  const [purchase, setPurchase] = useState("7,89");
  const [shipping, setShipping] = useState("1,99");
  const [importTax, setImportTax] = useState("3,60");
  const [salePrice, setSalePrice] = useState("24,90");

  const result = useMemo(() => {
    const p = parseEuro(purchase);
    const s = parseEuro(shipping);
    const t = parseEuro(importTax);
    const sale = parseEuro(salePrice);

    const totalCost = p + s + t;
    const margin = sale - totalCost;
    const marginPct = sale > 0 ? (margin / sale) * 100 : 0;
    const roiPct = totalCost > 0 ? (margin / totalCost) * 100 : 0;

    return { totalCost, margin, marginPct, roiPct };
  }, [purchase, shipping, importTax, salePrice]);

  const isProfitable = result.margin > 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
        <h2 className="text-lg font-semibold text-white">
          Calculateur de marge
        </h2>
        <p className="mt-1 mb-6 text-sm text-white/40">
          Renseignez vos propres coûts -- le calcul se met à jour en direct.
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
            label="Prix de vente"
            value={salePrice}
            onChange={setSalePrice}
          />
        </div>

        <motion.div
          key={`${result.totalCost}-${result.margin}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5 sm:grid-cols-4"
        >
          <div>
            <p className="text-xs text-white/40">Coût total</p>
            <p className="mt-1 text-lg font-bold text-white">
              {formatEuro(result.totalCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40">Marge nette</p>
            <p
              className={`mt-1 text-lg font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.6)] ${
                isProfitable ? "text-cyan-300" : "text-pink-400"
              }`}
            >
              {formatEuro(result.margin)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40">Marge %</p>
            <p className="mt-1 text-lg font-bold text-white">
              {formatPct(result.marginPct)}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-white/40">
              <TrendingUp className="h-3 w-3" /> ROI
            </p>
            <p className="mt-1 text-lg font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]">
              {formatPct(result.roiPct)}
            </p>
          </div>
        </motion.div>

        {!isProfitable && (
          <p className="mt-3 text-center text-xs text-pink-300">
            Marge négative avec ces chiffres -- augmentez le prix de vente ou
            réduisez les coûts.
          </p>
        )}
      </div>
    </div>
  );
}
