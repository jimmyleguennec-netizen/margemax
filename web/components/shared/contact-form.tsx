"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, MessageSquare, User } from "lucide-react";

import { RgbLoader } from "@/components/ui/rgb-loader";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulaire de contact partage entre la section publique de la landing
 * (components/landing/contact.tsx, qui l'entoure d'un titre/texte de
 * section) et la modale "Service client" du dashboard
 * (components/dashboard/contact-modal.tsx) -- meme logique d'envoi
 * (POST /api/contact, backed par Resend), pour ne jamais avoir deux
 * implementations qui divergent.
 */
export function ContactForm({
  idPrefix,
  defaultEmail,
  onSuccess,
}: {
  idPrefix: string;
  /** Pre-remplit le champ email (utilisateur deja connecte dans le
   * dashboard) -- laisse vide et editable sur la landing, ou l'auteur du
   * message n'est pas forcement connu. */
  defaultEmail?: string;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSend = Boolean(
    name.trim() && EMAIL_PATTERN.test(email.trim()) && message.trim()
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    if (!name.trim()) {
      setFormError("Merci d'indiquer ton nom.");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFormError("Merci d'indiquer une adresse e-mail valide.");
      return;
    }
    if (!message.trim()) {
      setFormError("Merci d'écrire un message.");
      return;
    }

    setFormError(null);
    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setFormError(
          data.error ?? "Impossible d'envoyer ton message pour le moment. Réessaie."
        );
        setSending(false);
        return;
      }

      setSent(true);
      setSending(false);
      setName("");
      setEmail(defaultEmail ?? "");
      setMessage("");
      onSuccess?.();
    } catch (err) {
      console.error("[ContactForm] Échec de l'appel /api/contact :", err);
      setFormError(
        "Impossible de contacter le serveur pour le moment. Réessaie dans quelques instants."
      );
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-name`}
          className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
        >
          Nom
        </label>
        <div className="relative flex items-center">
          <User aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
          <input
            id={`${idPrefix}-name`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError(null);
              setSent(false);
            }}
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Jean Dupont"
            className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/50 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-email`}
          className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
        >
          Email
        </label>
        <div className="relative flex items-center">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
          <input
            id={`${idPrefix}-email`}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError(null);
              setSent(false);
            }}
            required
            placeholder="toi@exemple.com"
            className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/50 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-message`}
          className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
        >
          Message
        </label>
        <div className="relative">
          <MessageSquare aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 z-10 h-4 w-4 text-cyan-400/60" />
          <textarea
            id={`${idPrefix}-message`}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setFormError(null);
              setSent(false);
            }}
            required
            maxLength={5000}
            rows={4}
            placeholder="Ta question..."
            className="w-full resize-none rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/50 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
          />
        </div>
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-pink-400/30 bg-pink-400/10 px-3 py-2 text-xs text-pink-200">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSend || sending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.8)] transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-[0_0_28px_-2px_rgba(34,211,238,0.9)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-[position:0%_0]"
      >
        {sending ? (
          <>
            <RgbLoader size={16} />
            Envoi en cours...
          </>
        ) : (
          <>
            <Mail aria-hidden="true" className="h-4 w-4" />
            Envoyer le message
          </>
        )}
      </button>

      {sent && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          role="status"
          className="flex items-center gap-1.5 rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2 text-xs text-green-300"
        >
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          Ton message a été envoyé avec succès ! Nous te répondrons
          sous 24h.
        </motion.p>
      )}
    </form>
  );
}
