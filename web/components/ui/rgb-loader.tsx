"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// Cyan, magenta/rose, violet -- meme trio neon que le reste du site.
const PARTICLE_COLORS = ["#00f0ff", "#ff007f", "#a855f7"];
const TRAIL_LENGTH = 16;
const ROTATION_PERIOD_MS = 1100;

type TrailPoint = { x: number; y: number };

/**
 * Boucle de particules lumineuses tournant en cercle, dessinee sur un
 * <canvas> 2D : chaque particule laisse une trainee (positions recentes
 * redessinees avec une opacite/taille decroissantes). Le glow neon final
 * vient du filtre CSS drop-shadow applique au canvas.
 */
export function RgbLoader({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = size / 2;
    const orbitRadius = size * 0.34;
    const particleRadius = Math.max(1.1, size * 0.07);

    const trails: TrailPoint[][] = PARTICLE_COLORS.map(() => []);
    let rafId = 0;
    let startTime: number | null = null;
    let cancelled = false;

    function draw(time: number) {
      if (cancelled) return;
      if (startTime === null) startTime = time;
      const progress = (time - startTime) / ROTATION_PERIOD_MS;

      ctx!.clearRect(0, 0, size, size);

      PARTICLE_COLORS.forEach((color, i) => {
        const angle =
          progress * Math.PI * 2 + (i * (Math.PI * 2)) / PARTICLE_COLORS.length;
        const x = center + Math.cos(angle) * orbitRadius;
        const y = center + Math.sin(angle) * orbitRadius;

        const trail = trails[i];
        trail.unshift({ x, y });
        if (trail.length > TRAIL_LENGTH) trail.pop();

        for (let idx = trail.length - 1; idx >= 0; idx--) {
          const point = trail[idx];
          const fade = 1 - idx / TRAIL_LENGTH;
          ctx!.beginPath();
          ctx!.fillStyle = color;
          ctx!.globalAlpha = fade * 0.85;
          ctx!.arc(point.x, point.y, particleRadius * fade, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      ctx!.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      role="status"
      aria-label="Chargement"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        filter: "drop-shadow(0 0 8px #ff007f) drop-shadow(0 0 12px #00f0ff)",
      }}
      className={cn("inline-block shrink-0", className)}
    />
  );
}
