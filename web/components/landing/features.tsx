"use client";

import { motion } from "framer-motion";
import { Calculator, ShieldCheck, BookMarked, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: Calculator,
    title: "Calcul de marge instantané",
    description:
      "Prix produit, livraison et frais d'importation réels combinés pour une marge et un ROI exacts, jamais estimés au hasard.",
    accent: "cyan",
    span: "lg:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Données vérifiées",
    description:
      "Chaque champ affiche sa source et un badge de vérification croisée avec le total réel payé au checkout.",
    accent: "fuchsia",
    span: "lg:col-span-1",
  },
  {
    icon: BookMarked,
    title: "Carnet & comparateur",
    description:
      "Centralisez vos favoris, comparez plusieurs fournisseurs et exportez vos analyses en un clic.",
    accent: "pink",
    span: "lg:col-span-1",
  },
  {
    icon: Sparkles,
    title: "Générateur de fiche IA",
    description:
      "Génère automatiquement une fiche produit prête à publier à partir des données vérifiées.",
    accent: "purple",
    span: "lg:col-span-2",
  },
];

const accentStyles: Record<string, { icon: string; border: string; glow: string }> = {
  cyan: {
    icon: "bg-cyan-400/10 text-cyan-300",
    border: "hover:border-cyan-400/50",
    glow: "group-hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.6)]",
  },
  fuchsia: {
    icon: "bg-fuchsia-400/10 text-fuchsia-300",
    border: "hover:border-fuchsia-400/50",
    glow: "group-hover:shadow-[0_0_40px_-12px_rgba(232,121,249,0.6)]",
  },
  pink: {
    icon: "bg-pink-400/10 text-pink-300",
    border: "hover:border-pink-400/50",
    glow: "group-hover:shadow-[0_0_40px_-12px_rgba(244,114,182,0.6)]",
  },
  purple: {
    icon: "bg-purple-400/10 text-purple-300",
    border: "hover:border-purple-400/50",
    glow: "group-hover:shadow-[0_0_40px_-12px_rgba(192,132,252,0.6)]",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Features() {
  return (
    <section id="features" className="container py-20 sm:py-28">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Tout pour sourcer avec confiance
        </h2>
        <p className="mt-3 text-white/50">
          Conçu pour les vendeurs qui veulent des chiffres fiables, pas des
          approximations.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature) => {
          const accent = accentStyles[feature.accent];
          return (
            <motion.div
              key={feature.title}
              variants={item}
              className={cn(feature.span)}
            >
              <div
                className={cn(
                  "group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300",
                  accent.border,
                  accent.glow
                )}
              >
                <div
                  className={cn(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                    accent.icon
                  )}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-white/50">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
