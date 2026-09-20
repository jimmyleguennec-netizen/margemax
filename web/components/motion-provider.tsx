"use client";

import { MotionConfig } from "framer-motion";

/** Respecte prefers-reduced-motion pour TOUTES les animations Framer Motion
 * (transformations/deplacements desactives, fondus conserves) -- le CSS
 * global ne couvre que les animations CSS. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
