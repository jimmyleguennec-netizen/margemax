"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Zap } from "lucide-react";

import { PACKS, formatEuro, formatPricePerCredit, type Pack } from "@/lib/packs";

/**
 * Selection de pack DANS le dashboard (au lieu de renvoyer vers /#pricing
 * sur la landing page, qui faisait quitter l'espace connecte). Ne fait
 * que choisir le pack : la case de consentement "execution immediate +
 * renonciation retractation" (art. L.221-28) et la redirection Stripe
 * restent geres par CheckoutConsentDialog, deja branche par l'appelant
 * (voir dashboard-shell.tsx) -- ce modal se ferme des qu'un pack est
 * choisi, laissant CheckoutConsentDialog prendre le relais.
 */
export function BuyCreditsModal({
  open,
  onClose,
  onChoosePack,
}: {
  open: boolean;
  onClose: () => void;
  onChoosePack: (pack: Pack) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-credits-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0a14] p-6 shadow-[0_0_60px_-10px_rgba(217,70,239,0.4)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-300">
              <Zap className="h-5 w-5" />
              <h2 id="buy-credits-title" className="text-lg font-bold text-white">
                Acheter des crédits
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/50">
              Sans abonnement — les crédits n&apos;expirent pas.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {PACKS.map((pack) => (
                <button
                  key={pack.key}
                  type="button"
                  onClick={() => onChoosePack(pack)}
                  className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center transition-all hover:border-cyan-400/60 hover:bg-cyan-400/[0.06] hover:shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)]"
                >
                  <span className="text-sm font-semibold text-white">{pack.label}</span>
                  <span className="mt-1 text-xs text-cyan-200">{pack.credits} crédits</span>
                  <span className="mt-2 text-lg font-bold text-white">
                    {formatEuro(pack.priceEuros)}
                  </span>
                  <span className="mt-0.5 text-[11px] text-white/30">
                    {formatPricePerCredit(pack)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
