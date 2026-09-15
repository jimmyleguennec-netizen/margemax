"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

// Exemples generiques (aucune donnee reelle ni nom de personne) --
// preuve sociale illustrative pour la landing page.
const activities = [
  { city: "Paris", pack: "Pack Avancé", credits: 35 },
  { city: "Lyon", pack: "Pack Essentiel", credits: 15 },
  { city: "Marseille", pack: "Pack Ultimate", credits: 200 },
  { city: "Bordeaux", pack: "Pack Starter", credits: 5 },
  { city: "Lille", pack: "Pack Pro", credits: 80 },
  { city: "Toulouse", pack: "Pack Avancé", credits: 35 },
];

const FIRST_DELAY_MS = 4000;
const DISPLAY_MS = 5000;
const GAP_MS = 7000;

export function LiveActivityToast() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    let showTimer: number;
    let hideTimer: number;
    let cursor = 0;

    function scheduleShow(delay: number) {
      showTimer = window.setTimeout(() => {
        if (stoppedRef.current) return;
        setActiveIndex(cursor % activities.length);
        cursor += 1;
        hideTimer = window.setTimeout(() => {
          if (stoppedRef.current) return;
          setActiveIndex(null);
          scheduleShow(GAP_MS);
        }, DISPLAY_MS);
      }, delay);
    }

    scheduleShow(FIRST_DELAY_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  function dismiss() {
    stoppedRef.current = true;
    setActiveIndex(null);
  }

  const activity = activeIndex !== null ? activities[activeIndex] : null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
      <AnimatePresence>
        {activity && (
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: -24, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="pointer-events-auto flex max-w-xs items-center gap-3 rounded-xl border border-cyan-400/20 bg-[#0a0a14]/90 p-3.5 pr-3 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] backdrop-blur-md"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 text-cyan-300">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                Un utilisateur à {activity.city}
              </p>
              <p className="truncate text-xs text-white/50">
                vient d&apos;acheter le{" "}
                <span className="text-cyan-300">
                  {activity.pack} -- {activity.credits} crédits
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer la notification"
              className="shrink-0 rounded-md p-1 text-white/30 transition-colors hover:text-white/70"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
