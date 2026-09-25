"use client";

import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Mail } from "lucide-react";

import type { AuthActionState } from "@/lib/actions/auth";
import { RgbLoader } from "@/components/ui/rgb-loader";

export function NeonField({
  id,
  name,
  type,
  label,
  icon: Icon,
  autoComplete,
  minLength,
  placeholder,
  required = true,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  icon: typeof Mail;
  autoComplete?: string;
  minLength?: number;
  placeholder?: string;
  /** Par defaut true, pour ne rien changer au comportement des champs
   * existants (email...) -- passe explicitement a false pour un champ
   * facultatif (ex. nom d'entreprise). */
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
      >
        {label}
        {!required && <span className="ml-1 normal-case text-white/50">(optionnel)</span>}
      </label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={placeholder}
          className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/50 outline-none md:backdrop-blur-sm transition-all duration-200 focus:border-cyan-400/60 focus:bg-white/[0.07] focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
        />
      </div>
    </div>
  );
}

export function NeonSubmitButton({
  children,
  loadingLabel,
  pending: pendingProp,
}: {
  children: React.ReactNode;
  /** Texte affiché a la place de `children` pendant l'envoi (ex. "Envoi
   * en cours...") -- en plus du spinner deja affiche, pour que
   * l'utilisateur voie un changement de texte, pas seulement une icone. */
  loadingLabel?: string;
  /** Force l'etat "en cours" (formulaire envoye par fetch, sans action). */
  pending?: boolean;
}) {
  const status = useFormStatus();
  // pending fourni par le parent (formulaires geres en fetch, sans action) ;
  // sinon l'etat de l'action de formulaire.
  const pending = pendingProp ?? status.pending;

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative mt-2 flex w-full origin-center items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.7)] transition-all duration-300 hover:scale-x-105 hover:bg-[position:100%_0] hover:shadow-[0_0_30px_-2px_rgba(34,211,238,0.8)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-x-100"
    >
      {pending && <RgbLoader size={16} />}
      {pending && loadingLabel ? loadingLabel : children}
    </button>
  );
}

export function NeonMessage({ state }: { state: AuthActionState }) {
  return (
    <AnimatePresence mode="wait">
      {state?.error && (
        <motion.p
          key="error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-md border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-xs text-pink-300"
        >
          {state.error}
        </motion.p>
      )}
      {state?.message && (
        <motion.p
          key="message"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200"
        >
          {state.message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
