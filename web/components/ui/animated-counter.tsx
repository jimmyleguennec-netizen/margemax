"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

/**
 * Compteur ENTIER qui s'incremente/decremente en douceur (count-up).
 * Reserve aux nombres entiers non financiers (soldes de credits, nombre
 * d'achats...) : on n'interpole volontairement JAMAIS un montant ou une
 * marge en euros -- les valeurs intermediaires ne correspondraient a aucun
 * prix reel (voir components/ui/count-up.tsx). La valeur FINALE est
 * toujours exposee telle quelle aux lecteurs d'ecran (sr-only) ; la
 * valeur animee est masquee (aria-hidden) pour ne jamais annoncer un
 * chiffre intermediaire. prefers-reduced-motion : affichage direct.
 */
export function AnimatedCounter({
  value,
  duration = 0.9,
  fromZero = true,
  className,
}: {
  value: number;
  duration?: number;
  /** true : premier affichage depuis 0 ; false : demarre a la valeur. */
  fromZero?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce || !fromZero ? value : 0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("fr-FR"));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, duration, reduce, mv]);

  return (
    <>
      <span className="sr-only">{value.toLocaleString("fr-FR")}</span>
      <motion.span aria-hidden="true" className={className}>
        {text}
      </motion.span>
    </>
  );
}
