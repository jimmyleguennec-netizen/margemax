"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, X, Zap } from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useDialogA11y } from "@/lib/hooks/use-dialog-a11y";

// Particules de celebration : angles/distances fixes (pas de hasard au
// rendu, donc rendu identique a chaque ouverture).
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * Math.PI * 2,
  distance: 90 + (i % 3) * 28,
  color: ["#22d3ee", "#d946ef", "#8b5cf6", "#f472b6"][i % 4],
  size: 5 + (i % 3) * 2,
}));

/**
 * Celebration apres un achat de credits CONFIRME (ligne credit_purchases
 * reellement creee par le webhook Stripe) : halo neon, eclats, compteur de
 * credits qui s'incremente. `credits` est le nombre reellement credite.
 */
export function PurchaseSuccessModal({
  credits,
  packLabel,
  onClose,
}: {
  credits: number | null;
  packLabel?: string;
  onClose: () => void;
}) {
  const open = credits !== null;
  const dialogRef = useDialogA11y<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-[#05050a]/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-success-title"
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 20, stiffness: 220 }}
            className="relative w-full max-w-sm overflow-visible rounded-3xl border border-cyan-300/30 bg-[#0a0a14] p-8 text-center shadow-[0_0_80px_-10px_rgba(34,211,238,0.55),0_0_120px_-30px_rgba(217,70,239,0.6)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-white/60 transition-colors hover:text-white"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>

            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <motion.span
                aria-hidden="true"
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-cyan-300"
              />
              {PARTICLES.map((p, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(p.angle) * p.distance,
                    y: Math.sin(p.angle) * p.distance,
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{ duration: 1.1, delay: 0.1 + (i % 4) * 0.03, ease: "easeOut" }}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px 2px ${p.color}`,
                  }}
                />
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 180, delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/50 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.7)]"
              >
                <PartyPopper aria-hidden="true" className="h-9 w-9 text-cyan-200" />
              </motion.div>
            </div>

            <h2 id="purchase-success-title" className="mt-6 text-xl font-bold text-white">
              Paiement confirmé !
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {packLabel ? `Pack ${packLabel} — ` : ""}tes crédits sont déjà sur ton compte.
            </p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", damping: 20, stiffness: 200 }}
              className="mt-5 flex items-center justify-center gap-2 text-5xl font-extrabold text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.85)]"
            >
              <Zap aria-hidden="true" className="h-8 w-8" />+
              <AnimatedCounter value={credits ?? 0} duration={1.2} />
            </motion.p>
            <p className="mt-1 text-sm font-medium text-white/70">crédits ajoutés</p>

            <button
              type="button"
              onClick={onClose}
              className="mt-7 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(217,70,239,0.8)]"
            >
              C&apos;est parti
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
