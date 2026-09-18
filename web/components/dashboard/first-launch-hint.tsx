"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

const STORAGE_KEY = "margemax_first_launch_hint_dismissed";

/**
 * Aide de premier lancement : simple bandeau explicatif, jamais reaffiche
 * une fois ferme (localStorage cote navigateur -- pas de compte a gerer,
 * pas de dependance serveur). echoue silencieusement si localStorage est
 * indisponible (navigation privee stricte, etc.) en affichant quand meme
 * le bandeau plutot que de planter la page.
 */
export function FirstLaunchHint() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Rien a faire : la fermeture reste effective pour cette session.
    }
  }

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto mb-6 flex max-w-3xl items-start gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4 text-sm text-white/70"
    >
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <p className="flex-1">
        Bienvenue ! Onglet <strong className="text-white">Recherche</strong> :
        analysez un produit AliExpress (1 crédit par analyse réussie, jamais
        débité en cas d&apos;échec). Onglet{" "}
        <strong className="text-white">Calculateur</strong> : testez vos
        propres coûts sans consommer de crédit. Onglet{" "}
        <strong className="text-white">Historique</strong> : vos analyses de
        cette session (non sauvegardées après rechargement).
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fermer cette aide"
        className="shrink-0 text-white/40 transition-colors hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
