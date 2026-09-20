"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Enveloppe de carte avec survol "premium" : leger soulevement 3D
 * (scale + y, ressort) et aura neon cyan/violette qui s'allume derriere la
 * carte. Purement visuel -- ne touche jamais au contenu ni aux handlers
 * des enfants. whileHover de Framer Motion ne se declenche qu'avec un vrai
 * pointeur (pas au toucher) et respecte prefers-reduced-motion via
 * MotionConfig (voir components/motion-provider.tsx).
 *
 * `className` doit porter le rayon de la carte (ex. "rounded-2xl") pour
 * que l'aura le suive ; la carte elle-meme (fond, bordure) reste dans les
 * enfants.
 */
export function GlowCard({
  children,
  className,
  scale = 1.02,
  lift = -5,
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  lift?: number;
}) {
  return (
    <motion.div
      whileHover={{ scale, y: lift }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn("group relative isolate", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 -z-10 rounded-[inherit] bg-gradient-to-r from-cyan-400/50 via-fuchsia-500/40 to-violet-500/50 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-cyan-300/0 transition-all duration-300 group-hover:ring-cyan-300/40"
      />
      {children}
    </motion.div>
  );
}
