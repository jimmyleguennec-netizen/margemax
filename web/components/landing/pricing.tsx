"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBuyButton } from "@/components/ui/animated-buy-button";

const benefits = [
  "Accès direct au lien produit AliExpress",
  "Déclinaisons & options complètes (couleurs, tailles, modèles)",
  "Analyse de sourcing avec calcul de marge automatique",
  "Générateur de fiche produit IA",
];

const packs = [
  { key: "starter", label: "Starter", credits: 5, price: "2,99 €", perCredit: "0,60 €/crédit", popular: false },
  { key: "essentiel", label: "Essentiel", credits: 15, price: "7,99 €", perCredit: "0,53 €/crédit", popular: false },
  { key: "avance", label: "Avancé", credits: 35, price: "14,99 €", perCredit: "0,42 €/crédit", popular: true },
  { key: "pro", label: "Pro", credits: 80, price: "29,99 €", perCredit: "0,37 €/crédit", popular: false },
  { key: "ultimate", label: "Ultimate", credits: 200, price: "59,99 €", perCredit: "0,30 €/crédit", popular: false },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function Pricing() {
  return (
    <section id="pricing" className="container py-20 sm:py-28">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Des crédits, pas un abonnement
        </h2>
        <p className="mt-3 text-white/50">
          3 crédits offerts à l&apos;inscription. Achetez uniquement ce dont
          vous avez besoin, sans engagement, sans date de renouvellement.
        </p>
      </div>

      <ul className="mx-auto mb-12 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/50">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <Check className="h-4 w-4 shrink-0 text-cyan-400" />
            {b}
          </li>
        ))}
      </ul>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        {packs.map((pack) => (
          <motion.div key={pack.key} variants={item} className="relative h-full">
            {pack.popular && (
              <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-[0_0_16px_-2px_rgba(34,211,238,0.8)]">
                Le plus populaire
              </span>
            )}

            <div
              className={cn(
                "relative h-full rounded-2xl p-[1.5px] transition-transform duration-300",
                pack.popular
                  ? "bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-purple-500 shadow-[0_0_50px_-10px_rgba(217,70,239,0.6)] sm:scale-105"
                  : "bg-white/10"
              )}
            >
              <div
                className={cn(
                  "flex h-full flex-col rounded-2xl bg-[#0a0a14] p-6",
                  pack.popular && "bg-[#0d0a16]"
                )}
              >
                <p className="text-sm font-medium text-white/50">
                  Pack {pack.label}
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {pack.price}
                </p>
                <p className="mt-1 text-sm text-white/40">
                  {pack.credits} crédits · {pack.perCredit}
                </p>

                <div className="flex-1" />

                <AnimatedBuyButton
                  label="Choisir ce pack"
                  successLabel="C'est parti !"
                  href="/signup"
                  className="mt-6"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <p className="mt-8 text-center text-xs text-white/30">
        Paiement 100 % sécurisé via Stripe. Créez votre compte pour acheter un
        pack de crédits.
      </p>
    </section>
  );
}
