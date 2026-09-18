"use client";

import { motion } from "framer-motion";

import { ContactForm } from "@/components/shared/contact-form";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@autoutilshop.fr";

export function Contact() {
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

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm"
      >
        <ContactForm idPrefix="landing-contact" />
      </motion.div>
    </section>
  );
}
