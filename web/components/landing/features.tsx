"use client";

import { motion } from "framer-motion";
import { Calculator, ShieldCheck, History } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionGlow } from "@/components/ui/section-glow";

const features = [
  {
    icon: Calculator,
    title: "Calcul de marge instantané",
    description:
      "Prix produit, livraison et frais d'importation combinés pour une marge et un ROI calculés à partir des données disponibles, en distinguant confirmé, estimé et indisponible.",
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
    icon: History,
    title: "Historique de session",
    description:
      "Retrouvez vos dernières analyses dans l'onglet Historique, sans les perdre en changeant d'onglet.",
    accent: "pink",
    span: "lg:col-span-1",
  },
];

const accentStyles: Record<string, { icon: string }> = {
  cyan: { icon: "bg-cyan-400/10 text-cyan-300" },
  fuchsia: { icon: "bg-fuchsia-400/10 text-fuchsia-300" },
  pink: { icon: "bg-pink-400/10 text-pink-300" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Features() {
  return (
    <section id="features" className="container relative scroll-mt-20 py-20 sm:py-28">
      <SectionGlow />
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Comparez les offres et comprenez vos coûts
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
        viewport={{ once: true, margin: "-50px" }}
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
              <div className="h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                <div
                  className={cn(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                    accent.icon
                  )}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="relative z-0 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="relative z-0 mt-2 text-sm text-white/50">
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
