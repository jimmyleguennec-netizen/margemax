"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaFooter() {
  return (
    <>
      <section className="container pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center backdrop-blur-sm"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10"
          />
          <div className="flex flex-col items-center gap-6">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prêt à arrêter de deviner vos marges ?
            </h2>
            <p className="max-w-md text-white/50">
              Créez votre compte gratuitement et testez votre premier produit
              en quelques secondes.
            </p>
            <span className="relative inline-flex overflow-hidden rounded-full p-[1.5px]">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#22d3ee_0%,#d946ef_50%,#22d3ee_100%)]" />
              <Link
                href="/signup"
                className="relative z-10 inline-flex items-center rounded-full bg-[#05050a] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0a0a14]"
              >
                Commencer maintenant
              </Link>
            </span>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} MargeMax. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white">
              Connexion
            </Link>
            <Link href="/signup" className="hover:text-white">
              Créer un compte
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
