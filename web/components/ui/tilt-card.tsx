"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Wrapper 3D reutilisable : incline la carte vers le curseur (rotateX/rotateY
 * ressort) et fait suivre une lueur neon radiale a la position de la souris.
 * Le glow est pointer-events-none pour ne jamais bloquer les boutons/liens
 * places a l'interieur des children.
 */
export function TiltCard({
  children,
  className,
  glowColor = "rgba(34,211,238,0.35)",
  maxTilt = 8,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 300, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 300, damping: 20 });

  const glowBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(220px circle at ${x}px ${y}px, ${glowColor}, transparent 70%)`
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    mouseX.set(px);
    mouseY.set(py);
    rawRotateY.set((px / rect.width - 0.5) * maxTilt * 2);
    rawRotateX.set(-(py / rect.height - 0.5) * maxTilt * 2);
  }

  function handleMouseLeave() {
    rawRotateX.set(0);
    rawRotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={cn("relative", className)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        style={{ background: glowBackground }}
      />
      {children}
    </motion.div>
  );
}
