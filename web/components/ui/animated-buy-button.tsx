"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";

type Status = "idle" | "success";

const REDIRECT_DELAY = 1500;
const RESET_DELAY = 2000;

export function AnimatedBuyButton({
  label,
  successLabel = "Ajouté !",
  href,
  packId,
  onConfirm,
  className,
  onIntercept,
}: {
  label: string;
  successLabel?: string;
  /** Present => mode "redirection" (ex. visiteur non connecte depuis la Landing Page). */
  href?: string;
  /** Ajoute ?pack=<packId> a l'URL de redirection, pour reprendre l'achat de ce pack une fois connecte. */
  packId?: string;
  /** Mode "autonome" (pas de href) : appele juste avant la reinitialisation. */
  onConfirm?: () => void;
  className?: string;
  /**
   * Quand fourni, le clic n'anime/ne redirige plus lui-meme : il delegue
   * entierement au parent (ex. ouvrir la case a cocher de consentement
   * "execution immediate + renonciation retractation" avant un vrai
   * paiement Stripe). Le bouton reste en etat "idle" jusqu'au prochain clic.
   */
  onIntercept?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout>>();

  // Ne laisse jamais un timeout en attente reinitialiser un bouton demonte
  // (navigation ailleurs, fermeture de la carte, etc.).
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick() {
    if (status !== "idle") return;

    if (onIntercept) {
      onIntercept();
      return;
    }

    setStatus("success");

    if (href) {
      // Visiteur non connecte (Landing Page) : on laisse l'animation de
      // confirmation se jouer puis on redirige -- jamais de retour a
      // l'etat idle ici puisque le composant va etre demonte.
      timeoutRef.current = window.setTimeout(() => {
        onConfirm?.();
        const target = packId
          ? `${href}${href.includes("?") ? "&" : "?"}pack=${encodeURIComponent(packId)}`
          : href;
        router.push(target);
      }, REDIRECT_DELAY);
    } else {
      // Usage autonome (pas de redirection) : revient toujours a l'etat
      // initial pour que le bouton ne reste jamais bloque sur "succes".
      timeoutRef.current = window.setTimeout(() => {
        onConfirm?.();
        setStatus("idle");
      }, RESET_DELAY);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status !== "idle"}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed",
        status === "success"
          ? "border border-green-400/60 bg-green-400/10 text-green-300 shadow-[0_0_24px_-4px_rgba(74,222,128,0.8)]"
          : "bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.8)] hover:bg-[position:100%_0] hover:shadow-[0_0_28px_-2px_rgba(34,211,238,0.9)]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" ? (
          <motion.span
            key="idle"
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {label}
          </motion.span>
        ) : (
          <motion.span
            key="success"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.35, 1] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex"
            >
              <Check className="h-4 w-4" />
            </motion.span>
            {successLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
