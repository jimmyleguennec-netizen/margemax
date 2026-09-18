"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calculator,
  CheckCircle2,
  Link2,
  Search,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { CountUp } from "@/components/ui/count-up";
import { SectionGlow } from "@/components/ui/section-glow";

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatPct(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
}

const guideSteps: {
  id: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "recherche",
    icon: Search,
    label: "1. Recherche",
    title: "Saisissez un mot-clé ou collez l'URL d'une annonce AliExpress",
    description:
      "Fonctionne avec un simple mot-clé (ex. « chargeur induction ») ou un lien produit direct.",
  },
  {
    id: "analyse",
    icon: Calculator,
    label: "2. Analyse",
    title: "Analyse instantanée des prix, livraison et taxes d'importation",
    description:
      "Chaque coût est extrait réellement au checkout, avec un statut confirmé, estimé ou indisponible.",
  },
  {
    id: "marge",
    icon: Sparkles,
    label: "3. Marge",
    title: "Découverte de la marge avant publicité et autres frais, et de l'indice de fiabilité",
    description:
      "Marge, ROI et un score de fiabilité qui diminue quand la part de frais estimés (non confirmés au checkout) augmente.",
  },
  {
    id: "decision",
    icon: TrendingUp,
    label: "4. Décision",
    title: "Sélection de l'offre la plus rentable",
    description:
      "Comparez plusieurs annonces AliExpress et gardez la meilleure automatiquement.",
  },
];

function SearchVisual() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-white/5 px-3 py-2.5 text-xs text-white/50">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
        <span className="truncate">chargeur à induction pour iPhone</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-cyan-300/80">
        <motion.span
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.8)]"
        />
        Scan des annonces en direct
      </div>
    </div>
  );
}

const ANALYZE_ROWS = [
  { label: "Sous-total", value: 14.49 },
  { label: "Livraison", value: 0 },
  { label: "Taxes", value: 3.6 },
];

function AnalyzeVisual() {
  return (
    <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">
      <div className="relative h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          animate={{ x: ["-100%", "220%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        />
      </div>
      {ANALYZE_ROWS.map((row, i) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.15, duration: 0.3 }}
          className="flex items-center justify-between text-white/50"
        >
          <span>{row.label}</span>
          <span className="font-medium text-white">
            {row.value === 0 ? "Gratuit" : <CountUp value={row.value} format={formatEuro} duration={0.6} />}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function MarginVisual() {
  return (
    <div className="mt-4 space-y-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] p-3">
      <div className="flex items-center gap-4">
        <CircularGauge value={94} size={52} strokeWidth={4} />
        <div>
          <p className="text-xs text-white/40">Marge avant pub</p>
          <p className="text-lg font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            <CountUp value={21.81} format={formatEuro} />
          </p>
          <p className="text-xs text-white/40">
            ROI <CountUp value={120.6} format={formatPct} />
          </p>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-[11px] text-white/40">
          <span>Indice de fiabilité</span>
          <span className="font-medium text-cyan-300">94 %</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "94%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
          />
        </div>
        <p className="mt-1.5 text-[10px] text-white/30">
          Exemple illustratif — pas une donnée de marché garantie.
        </p>
      </div>
    </div>
  );
}

function DecisionVisual() {
  return (
    <div className="mt-4 space-y-1.5">
      <div className="flex items-center justify-between rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] px-3 py-2 text-xs shadow-[0_0_14px_-4px_rgba(34,211,238,0.5)]">
        <span className="flex items-center gap-1.5 text-white">
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
          Offre n° 1
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300"
          >
            Meilleur choix
          </motion.span>
        </span>
        <span className="font-medium text-cyan-300">120,6 % ROI</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/50">
        <span>Offre n° 2</span>
        <span>60,2 % ROI</span>
      </div>
    </div>
  );
}

const visuals: Record<string, () => JSX.Element> = {
  recherche: SearchVisual,
  analyse: AnalyzeVisual,
  marge: MarginVisual,
  decision: DecisionVisual,
};

export function QuickGuide() {
  const [active, setActive] = useState(guideSteps[0].id);
  const activeStep = guideSteps.find((step) => step.id === active) ?? guideSteps[0];
  const ActiveVisual = visuals[activeStep.id];

  return (
    <section id="guide" className="container relative scroll-mt-20 py-20 sm:py-28">
      <SectionGlow />
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Prenez en main l&apos;outil en 30 secondes
        </h2>
        <p className="mt-3 text-white/50">
          Le parcours complet, du compte gratuit à la décision d&apos;achat.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-[220px_1fr]">
        <div className="relative flex flex-row gap-2 overflow-x-auto sm:flex-col sm:gap-1 sm:overflow-visible">
          {guideSteps.map((step) => {
            const isActive = step.id === active;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActive(step.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors duration-200",
                  isActive ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="quick-guide-indicator"
                    className="absolute inset-0 rounded-lg bg-white/5 sm:border-l-2 sm:border-cyan-400 sm:shadow-[inset_0_0_20px_-8px_rgba(34,211,238,0.6)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <step.icon
                  className={cn(
                    "relative z-10 h-4 w-4 shrink-0",
                    isActive ? "text-cyan-300" : "text-white/40"
                  )}
                />
                <span className="relative z-10 whitespace-nowrap sm:whitespace-normal">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[320px] rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 text-cyan-300 shadow-[0_0_20px_-6px_rgba(34,211,238,0.6)]">
                <activeStep.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {activeStep.title}
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/50">
                {activeStep.description}
              </p>
              <ActiveVisual />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
