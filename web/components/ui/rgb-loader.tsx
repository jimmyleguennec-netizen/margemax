"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function RgbLoader({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <motion.span
      role="status"
      aria-label="Chargement"
      className={cn("relative inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #22d3ee, #d946ef, #f472b6, #22d3ee)",
          filter: "drop-shadow(0 0 6px rgba(217,70,239,0.7))",
        }}
      />
      <span
        className="absolute rounded-full bg-[#05050a]"
        style={{ inset: Math.max(2, Math.round(size * 0.18)) }}
      />
    </motion.span>
  );
}
