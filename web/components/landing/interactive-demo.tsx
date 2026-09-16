"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Calculator,
  CheckCircle2,
  Clipboard,
  Link2,
  TrendingUp,
} from "lucide-react";

import { RgbLoader } from "@/components/ui/rgb-loader";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatPct(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
}

const steps = [
  {
    id: 1,
    icon: Link2,
    title: "Entrez un mot-clé ou une URL AliExpress",
    description:
      "Tapez un mot-clé ou collez le lien du produit -- MargeMax récupère prix, livraison et variantes automatiquement.",
  },
  {
    id: 2,
    icon: Calculator,
    title: "Calcul instantané des frais réels",
    description:
      "Prix produit, livraison et frais d'importation réels combinés -- jamais une estimation au hasard.",
  },
  {
    id: 3,
    icon: BadgeCheck,
    title: "Obtenez votre marge nette vérifiée",
    description:
      "Marge, ROI et badge de vérification croisée avec le total réellement payé au checkout.",
  },
] as const;

function MockupWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/10 to-pink-500/20 opacity-70 blur-2xl"
      />
      <div className="rounded-2xl bg-gradient-to-r from-cyan-400/60 via-fuchsia-500/60 to-pink-500/60 p-[1.5px] shadow-[0_0_50px_-15px_rgba(217,70,239,0.5)]">
        <div className="overflow-hidden rounded-2xl bg-[#0a0a14]">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/70" />
            <span className="ml-3 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-white/40">
              margemax.app/recherche
            </span>
          </div>
          <div className="min-h-[280px] p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function StepOneMockup() {
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col justify-center gap-4"
    >
      <p className="text-sm text-white/40">Mot-clé ou URL AliExpress</p>
      <div className="flex items-center gap-3 rounded-lg border border-cyan-400/30 bg-white/5 px-4 py-3 shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]">
        <Link2 className="h-4 w-4 shrink-0 text-cyan-300" />
        <span className="truncate text-sm text-white/70">
          fr.aliexpress.com/item/1005006478208156.html
        </span>
        <Clipboard className="ml-auto h-4 w-4 shrink-0 text-white/30" />
      </div>
      <p className="text-xs text-white/30">
        Fonctionne aussi bien avec un simple mot-clé (ex : « chargeur
        induction iphone ») qu&apos;avec un lien produit direct.
      </p>
    </motion.div>
  );
}

const CHECKOUT_ROWS = [
  { label: "Sous-total", value: 14.49 },
  { label: "Port", value: 0 },
  { label: "Taxes", value: 3.6 },
];

function StepTwoMockup() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const timer = window.setTimeout(() => setRevealed(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col justify-center gap-4"
    >
      <div className="flex items-center gap-3">
        {!revealed && <RgbLoader size={22} />}
        <p className="text-sm text-white/60">
          {revealed ? "Décompte réel du checkout" : "Analyse en cours..."}
        </p>
      </div>
      <AnimatePresence mode="wait">
        {revealed && (
          <motion.div
            key="rows"
            className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm"
          >
            {CHECKOUT_ROWS.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className="flex items-center justify-between text-white/50"
              >
                <span>{row.label}</span>
                <span className="font-medium text-white">
                  {row.value === 0 ? (
                    "Gratuit (0,00 €)"
                  ) : (
                    <CountUp value={row.value} format={formatEuro} duration={0.6} />
                  )}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StepThreeMockup() {
  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col justify-center gap-4"
    >
      <div>
        <p className="font-medium leading-tight text-white">
          Station de charge 3-en-1
        </p>
        <div className="mt-1.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-300 shadow-[0_0_14px_-4px_rgba(74,222,128,0.7)]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Coût vérifié
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
        <div>
          <p className="text-xs text-white/40">Total checkout</p>
          <p className="text-xl font-bold text-white">
            <CountUp value={18.09} format={formatEuro} />
          </p>
        </div>
        <div>
          <p className="text-xs text-white/40">Marge nette</p>
          <p className="text-xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
            <CountUp value={21.81} format={formatEuro} />
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-white/40">
            <TrendingUp className="h-3.5 w-3.5" /> ROI
          </p>
          <p className="text-xl font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]">
            <CountUp value={120.5} format={formatPct} />
          </p>
        </div>
        <div>
          <p className="text-xs text-white/40">Prix conseillé</p>
          <p className="text-xl font-bold text-white">
            <CountUp value={39.9} format={formatEuro} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function InteractiveDemo() {
  const [active, setActive] = useState<1 | 2 | 3>(1);

  return (
    <section className="container py-20 sm:py-28">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Trois clics, une marge vérifiée
        </h2>
        <p className="mt-3 text-white/50">
          Suivez le parcours complet, étape par étape.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="flex flex-col gap-3">
          {steps.map((step) => {
            const isActive = step.id === active;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActive(step.id)}
                className={cn(
                  "flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-300",
                  isActive
                    ? "border-cyan-400/40 bg-cyan-400/[0.06] shadow-[0_0_30px_-10px_rgba(34,211,238,0.6)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300",
                    isActive
                      ? "bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white shadow-[0_0_16px_-2px_rgba(34,211,238,0.8)]"
                      : "bg-white/10 text-white/50"
                  )}
                >
                  {step.id}
                </span>
                <div>
                  <p
                    className={cn(
                      "flex items-center gap-2 font-semibold",
                      isActive ? "text-white" : "text-white/70"
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-white/40">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <MockupWindow>
          <AnimatePresence mode="wait">
            {active === 1 && <StepOneMockup />}
            {active === 2 && <StepTwoMockup />}
            {active === 3 && <StepThreeMockup />}
          </AnimatePresence>
        </MockupWindow>
      </div>
    </section>
  );
}
