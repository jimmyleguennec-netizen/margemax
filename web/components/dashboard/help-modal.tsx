"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDialogA11y } from "@/lib/hooks/use-dialog-a11y";
import { CircleHelp, X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/faq";

/**
 * "Aide et paramètres" du menu du compte -- volontairement distincte de
 * "Ton compte" (qui bascule vers l'onglet Mon compte) : ouvre une vraie
 * modale d'aide plutot que de renvoyer vers la meme destination sous un
 * autre nom. Reutilise les memes questions/reponses que la FAQ publique
 * (lib/faq.ts, source unique) -- jamais un contenu d'aide invente et
 * distinct de ce qui est deja publie et verifie sur la landing.
 */
export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useDialogA11y<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
          aria-modal="true"
          aria-labelledby="help-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-white/10 bg-[#0a0a14] p-6 shadow-[0_0_60px_-10px_rgba(217,70,239,0.4)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-white/60 transition-colors hover:text-white"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-300">
              <CircleHelp aria-hidden="true" className="h-5 w-5" />
              <h2 id="help-modal-title" className="text-lg font-bold text-white">
                Aide et paramètres
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/70">
              Les réponses aux questions les plus fréquentes sur MargeMax.
            </p>

            <div className="mt-5 overflow-y-auto pr-1">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={faq.question}
                    value={`help-faq-${i}`}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] px-5 transition-all duration-300 data-[state=open]:border-cyan-400/40"
                  >
                    <AccordionTrigger className="text-sm text-white/90 hover:text-white">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-white/70">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
