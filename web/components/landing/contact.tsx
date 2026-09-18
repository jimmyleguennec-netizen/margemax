"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, ShieldCheck, User } from "lucide-react";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@autoutilshop.fr";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSend = Boolean(
    name.trim() && EMAIL_PATTERN.test(email.trim()) && message.trim()
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    if (!name.trim()) {
      setFormError("Merci d'indiquer votre nom.");
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

    const subject = encodeURIComponent(`Contact MargeMax : ${name || "Visiteur"}`);
    const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    setSending(false);
  }

  return (
    <section id="contact" className="container scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Une question ? Écrivez-nous
        </h2>
        <p className="mt-3 text-white/50">
          Réponse sous 24 h ouvrées, ou écrivez-nous directement à{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-cyan-300 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-lg space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
          >
            Nom
          </label>
          <div className="relative flex items-center">
            <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
            <input
              id="contact-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
                setSent(false);
              }}
              required
              placeholder="Jean Dupont"
              className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
          >
            Email
          </label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormError(null);
                setSent(false);
              }}
              required
              placeholder="vous@exemple.com"
              className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="contact-message"
            className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
          >
            Message
          </label>
          <div className="relative">
            <MessageSquare className="pointer-events-none absolute left-3 top-3.5 z-10 h-4 w-4 text-cyan-400/60" />
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setFormError(null);
                setSent(false);
              }}
              required
              rows={4}
              placeholder="Votre question..."
              className="w-full resize-none rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>

        {formError && (
          <p className="rounded-md border border-pink-400/30 bg-pink-400/10 px-3 py-2 text-xs text-pink-200">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSend || sending || sent}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.8)] transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-[0_0_28px_-2px_rgba(34,211,238,0.9)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-[position:0%_0]"
        >
          <Mail className="h-4 w-4" />
          Envoyer le message
        </button>

        {sent && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Votre application e-mail devrait s&apos;être ouverte avec le
            message pré-rempli : vérifiez qu&apos;elle s&apos;est bien
            ouverte, puis confirmez l&apos;envoi depuis celle-ci. Rien
            n&apos;est transmis tant que vous n&apos;avez pas cliqué sur
            envoyer dans votre application e-mail.
          </motion.p>
        )}
      </motion.form>
    </section>
  );
}
