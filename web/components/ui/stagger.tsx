"use client";

import { Children } from "react";
import { motion } from "framer-motion";

const container = (delay: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 26, stiffness: 220 } },
};

/**
 * Fait apparaitre chaque enfant direct avec un leger decalage (fondu +
 * glissement vers le haut). Chaque enfant est enveloppe dans un
 * motion.div : les selecteurs CSS "enfant direct" (ex. divide-y) du
 * conteneur continuent de s'appliquer aux enveloppes. Enfants vides
 * (false/null) ignores.
 */
export function StaggerList({
  children,
  className,
  delay = 0.07,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div variants={container(delay)} initial="hidden" animate="show" className={className}>
      {Children.toArray(children).map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Variante declenchee au defilement (whileInView) -- pour listes de la
 * landing. */
export function StaggerInView({
  children,
  className,
  delay = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={container(delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {Children.toArray(children).map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
