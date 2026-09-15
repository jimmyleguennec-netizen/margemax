"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

export function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  function toggle() {
    setVisible((v) => !v);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 400);
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-sm transition-all duration-200 focus:border-cyan-400/60 focus:bg-white/[0.07] focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className={cn(
            "absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-cyan-300/60 transition-colors duration-300 hover:text-cyan-300",
            pulse && "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {visible ? (
              <motion.span
                key="open"
                initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 20, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                <Eye className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="closed"
                initial={{ opacity: 0, rotate: 20, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -20, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                <EyeOff className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
