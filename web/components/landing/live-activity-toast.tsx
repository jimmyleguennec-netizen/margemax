"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, X } from "lucide-react";

// Exemples generiques (aucune donnee reelle ni nom de personne) --
// preuve sociale illustrative pour la landing page. Deux types
// d'evenements : analyse d'annonce en direct (60% des apparitions) et
// achat de pack de credits (40%).
type PurchaseActivity = {
  kind: "purchase";
  city: string;
  pack: string;
  credits: number;
};
type AnalysisActivity = { kind: "analysis"; city: string };
type Activity = PurchaseActivity | AnalysisActivity;

const purchaseActivities: PurchaseActivity[] = [
  { kind: "purchase", city: "Paris", pack: "Pack Avancé", credits: 35 },
  { kind: "purchase", city: "Marseille", pack: "Pack Ultimate", credits: 200 },
  { kind: "purchase", city: "Bordeaux", pack: "Pack Starter", credits: 5 },
  { kind: "purchase", city: "Lille", pack: "Pack Pro", credits: 80 },
  { kind: "purchase", city: "Toulouse", pack: "Pack Avancé", credits: 35 },
];

const analysisActivities: AnalysisActivity[] = [
  { kind: "analysis", city: "Lyon" },
  { kind: "analysis", city: "Nantes" },
  { kind: "analysis", city: "Strasbourg" },
  { kind: "analysis", city: "Rennes" },
  { kind: "analysis", city: "Nice" },
  { kind: "analysis", city: "Montpellier" },
];

const MIN_GAP_MS = 45_000;
const MAX_GAP_MS = 90_000;
const DISPLAY_MS = 6000;
const ANALYSIS_RATIO = 0.6; // 60% analyses en direct, 40% achats de pack

function randomGap() {
  return MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
}

function pickActivity(): Activity {
  const pool =
    Math.random() < ANALYSIS_RATIO ? analysisActivities : purchaseActivities;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function LiveActivityToast() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [key, setKey] = useState(0);
  const stoppedRef = useRef(false);

  useEffect(() => {
    let showTimer: number;
    let hideTimer: number;

    function scheduleShow(delay: number) {
      showTimer = window.setTimeout(() => {
        if (stoppedRef.current) return;
        setActivity(pickActivity());
        setKey((k) => k + 1);
        hideTimer = window.setTimeout(() => {
          if (stoppedRef.current) return;
          setActivity(null);
          scheduleShow(randomGap());
        }, DISPLAY_MS);
      }, delay);
    }

    scheduleShow(randomGap());

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  function dismiss() {
    stoppedRef.current = true;
    setActivity(null);
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
      <AnimatePresence>
        {activity && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="pointer-events-auto flex max-w-xs items-center gap-3 rounded-xl border border-cyan-400/20 bg-[#0a0a14]/90 p-3.5 pr-3 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] backdrop-blur-md"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 text-cyan-300">
              {activity.kind === "analysis" ? (
                <Search className="h-4 w-4" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                Un utilisateur à {activity.city}
              </p>
              <p className="truncate text-xs text-white/50">
                {activity.kind === "analysis" ? (
                  <span className="text-cyan-300">
                    analyse une annonce AliExpress...
                  </span>
                ) : (
                  <>
                    vient d&apos;acheter le{" "}
                    <span className="text-cyan-300">
                      {activity.pack} -- {activity.credits} crédits
                    </span>
                  </>
                )}
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
