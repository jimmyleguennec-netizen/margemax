"use client";

import { motion } from "framer-motion";

/**
 * Apparition au defilement (fondu + glissement vers le haut), une seule
 * fois. Enveloppe de section : ne modifie ni le contenu ni les ancres
 * (#demo, #pricing...) portees par les <section> enfants.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
