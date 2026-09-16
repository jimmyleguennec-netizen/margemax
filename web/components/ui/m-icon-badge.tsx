"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function MIconBadge({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-slate-900/90 p-2 shadow-[0_0_20px_rgba(0,240,255,0.4)]",
        className
      )}
    >
      <Image
        src="/images/logo-icon.png"
        alt="MargeMax"
        width={64}
        height={64}
        className="h-full w-full object-contain"
      />
    </motion.div>
  );
}
