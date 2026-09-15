"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Link2,
  LogIn,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const guideSteps: {
  id: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "compte",
    icon: LogIn,
    label: "1. Connectez-vous",
    title: "Créez votre compte gratuit",
    description:
      "10 secondes, aucune carte bancaire requise -- 3 crédits offerts dès l'inscription pour tester l'outil.",
  },
  {
    id: "lien",
    icon: Link2,
    label: "2. Collez un lien",
    title: "Ajoutez l'URL du produit",
    description:
      "Copiez le lien AliExpress du produit qui vous intéresse, ou lancez une recherche par mot-clé.",
  },
  {
    id: "analyse",
    icon: Sparkles,
    label: "3. Lancez l'analyse",
    title: "MargeMax calcule tout",
    description:
      "Prix, livraison, frais d'importation réels et marge nette calculés en moins de 3 secondes.",
  },
  {
    id: "decision",
    icon: TrendingUp,
    label: "4. Décidez",
    title: "Comparez et agissez",
    description:
      "Ajoutez le produit à votre carnet, comparez plusieurs fournisseurs et passez à l'achat en confiance.",
  },
];

export function QuickGuide() {
  const [active, setActive] = useState(guideSteps[0].id);
  const activeStep = guideSteps.find((step) => step.id === active) ?? guideSteps[0];

  return (
    <section className="container py-20 sm:py-28">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
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

        <div className="relative min-h-[220px] rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
