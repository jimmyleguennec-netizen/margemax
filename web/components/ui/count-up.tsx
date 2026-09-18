"use client";

import { motion } from "framer-motion";

/**
 * Affiche une valeur (montant, %...) avec un simple fondu d'apparition.
 * N'anime PLUS le nombre lui-meme de 0 vers sa valeur finale : cette
 * ancienne interpolation affichait pendant ~1 s des valeurs intermediaires
 * qui ne correspondaient a AUCUN prix/marge reel (ex. "12,34 €" puis
 * "45,67 €" avant d'atteindre le vrai "127,50 €") -- risque de
 * capture d'ecran ou de lecture d'une valeur transitoire trompeuse sur des
 * montants financiers. Le formatage (devise, %, decimales) reste a la
 * charge de l'appelant via `format`.
 */
export function CountUp({
  value,
  format,
  className,
}: {
  value: number;
  /** Conserve pour compatibilite des appels existants ; ignore (plus
   * d'interpolation numerique a durer). */
  duration?: number;
  format: (n: number) => string;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {format(value)}
    </motion.span>
  );
}
