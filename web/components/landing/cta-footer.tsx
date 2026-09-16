"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard } from "lucide-react";

import { Logo } from "@/components/ui/logo";

export function CtaFooter() {
  return (
    <>
      <section className="container pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center backdrop-blur-sm"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/20 via-transparent to-fuchsia-500/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-24 -z-10 h-64 rounded-full bg-cyan-500/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -bottom-24 -z-10 h-64 rounded-full bg-fuchsia-500/20 blur-[100px]"
          />
          <div className="flex flex-col items-center gap-6">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prêt à maximiser vos marges dès aujourd&apos;hui ?
            </h2>
            <p className="max-w-lg text-white/50">
              Rejoignez les e-commerçants qui analysent leurs coûts
              d&apos;importation au centime près. 3 crédits offerts à
              l&apos;inscription.
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
        <div className="container flex flex-col items-center gap-6">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-200">
              <CreditCard className="h-3.5 w-3.5" />
              Paiement 100 % sécurisé via Stripe
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/[0.06] px-3 py-1.5 text-xs font-medium text-fuchsia-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Données 100 % réelles vérifiées
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-white/40 sm:flex-row">
            <p>© {new Date().getFullYear()} MargeMax. Tous droits réservés.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/login" className="hover:text-white">
                Connexion
              </Link>
              <Link href="/signup" className="hover:text-white">
                Créer un compte
              </Link>
              <Link href="/mentions-legales" className="hover:text-white">
                Mentions légales
              </Link>
              <Link href="/cgv" className="hover:text-white">
                CGV / CGU
              </Link>
              <Link href="/confidentialite" className="hover:text-white">
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
