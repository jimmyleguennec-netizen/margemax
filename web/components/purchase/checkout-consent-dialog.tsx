"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { RgbLoader } from "@/components/ui/rgb-loader";
import { IMMEDIATE_EXECUTION_WAIVER_LABEL } from "@/lib/legal-consent";
import { formatEuro } from "@/lib/packs";

export type ConsentPack = {
  key: string;
  label: string;
  credits: number;
  priceEuros: number;
};

/**
 * Case a cocher "execution immediate + renonciation au droit de
 * retractation" (art. L.221-28), affichee juste avant toute redirection
 * vers un Payment Link Stripe reel (jamais avant /login?pack=... -- la ce
 * n'est pas encore un achat). Le consentement est enregistre cote serveur
 * (POST /api/consent/checkout) AVANT la redirection : si l'enregistrement
 * echoue, on bloque la redirection plutot que de prendre un paiement sans
 * preuve de consentement.
 */
export function CheckoutConsentDialog({
  pack,
  userId,
  onCancel,
}: {
  pack: ConsentPack | null;
  userId: string | undefined;
  onCancel: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    if (submitting) return;
    setChecked(false);
    setError(null);
    onCancel();
  }

  // Deux appels distincts, jamais fusionnes : (1) enregistre la preuve de
  // consentement retractation AVANT tout paiement -- doit reussir meme si
  // le paiement echoue ensuite, pour garder une trace de ce qui a ete
  // accepte ; (2) resout l'URL Stripe reelle cote SERVEUR (jamais calculee
  // ici a partir d'un userId client, qui repliait silencieusement sur
  // "/login?pack=..." pour un utilisateur pourtant deja connecte des qu'un
  // seul Payment Link etait mal configure -- voir app/api/checkout/route.ts).
  async function handleConfirm() {
    if (!pack || !userId || !checked || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const consentRes = await fetch("/api/consent/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packKey: pack.key }),
      });
      if (!consentRes.ok) {
        setError(
          "Impossible d'enregistrer votre consentement pour le moment. Réessayez."
        );
        setSubmitting(false);
        return;
      }

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packKey: pack.key }),
      });
      const checkoutData: { url?: string; error?: string } = await checkoutRes
        .json()
        .catch(() => ({}));

      if (!checkoutRes.ok || !checkoutData.url) {
        setError(
          checkoutData.error ??
            "Impossible de démarrer le paiement pour le moment. Réessayez."
        );
        setSubmitting(false);
        return;
      }

      // Redirection externe reelle (domaine Stripe) -- pas router.push, qui
      // est concu pour la navigation interne Next.js.
      window.location.href = checkoutData.url;
    } catch {
      setError(
        "Impossible de démarrer le paiement pour le moment. Réessayez."
      );
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {pack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-consent-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a14] p-6 shadow-[0_0_60px_-10px_rgba(217,70,239,0.4)]"
          >
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-300">
              <ShieldAlert className="h-5 w-5" />
              <h2 id="checkout-consent-title" className="text-lg font-bold text-white">
                Confirmer votre commande
              </h2>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Pack</span>
                <span className="font-medium text-white">{pack.label}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-white/50">Crédits</span>
                <span className="font-medium text-white">{pack.credits} crédits</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between border-t border-white/10 pt-1.5">
                <span className="text-white/50">Montant dû</span>
                <span className="font-bold text-cyan-300">{formatEuro(pack.priceEuros)}</span>
              </div>
            </div>

            <p className="mt-3 text-sm text-white/50">
              Le paiement crédite immédiatement votre compte, mais le
              service lui-même (l&apos;analyse de sourcing) s&apos;exécute
              progressivement, à chaque fois que vous utilisez un crédit —
              pas en une seule fois au moment du paiement. Conformément à
              l&apos;article L.221-28 du Code de la consommation, cocher la
              case ci-dessous constitue une action distincte demandant le
              début immédiat de cette exécution et renonçant à votre droit
              de rétractation de 14 jours pour cet achat.
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Checkbox
                id="checkout-consent-waiver"
                checked={checked}
                onChange={setChecked}
                label={IMMEDIATE_EXECUTION_WAIVER_LABEL}
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!checked || submitting}
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.8)] transition-opacity flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting && <RgbLoader size={16} />}
                {submitting ? "Redirection vers le paiement..." : "Confirmer et payer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
