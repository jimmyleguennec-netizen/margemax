"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LifeBuoy, X } from "lucide-react";

import { ContactForm } from "@/components/shared/contact-form";

/**
 * "Service client" du menu du compte -- ouvre le formulaire de contact
 * DANS l'application au lieu de renvoyer un utilisateur deja connecte
 * vers la section #contact de la landing page publique (qui le fait
 * quitter son espace). Meme formulaire/logique d'envoi que la landing
 * (components/shared/contact-form.tsx), email de l'utilisateur
 * pre-rempli puisqu'il est deja connu.
 */
export function ContactModal({
  open,
  onClose,
  defaultEmail,
}: {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
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
          aria-labelledby="contact-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a14] p-6 shadow-[0_0_60px_-10px_rgba(217,70,239,0.4)]"
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
              <LifeBuoy className="h-5 w-5" />
              <h2 id="contact-modal-title" className="text-lg font-bold text-white">
                Service client
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/50">
              Réponse sous 24 h ouvrées.
            </p>

            <div className="mt-5">
              <ContactForm idPrefix="dashboard-contact" defaultEmail={defaultEmail} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
