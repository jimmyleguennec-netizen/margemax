"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { AnimatedBuyButton } from "@/components/ui/animated-buy-button";
import { buildPackCheckoutHref } from "@/lib/stripe-links";
import { TiltCard } from "@/components/ui/tilt-card";
import { SectionGlow } from "@/components/ui/section-glow";
import { PACKS, formatEuro, formatPricePerCredit } from "@/lib/packs";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";

const benefits = [
  "Accès direct au lien produit AliExpress",
  "Variantes disponibles : couleurs, tailles et modèles",
  "Analyse de sourcing avec calcul de marge automatique",
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
  const { user } = useSupabaseUser();

  return (
    <section id="pricing" className="container relative scroll-mt-20 py-20 sm:py-28">
      <SectionGlow />
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Des crédits, pas un abonnement
        </h2>
        <p className="mt-3 text-white/50">
          <span className="font-bold text-amber-300">3 crédits offerts</span>{" "}
          à l&apos;inscription. Achetez uniquement ce dont vous avez besoin,
          sans engagement, sans date de renouvellement.
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
        {PACKS.map((pack) => (
          <motion.div
            key={pack.key}
            variants={item}
            whileHover={{ scale: 1.05, zIndex: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative h-full"
          >
            <TiltCard
              glowColor="rgba(34,211,238,0.35)"
              className="h-full rounded-2xl border border-white/10 bg-white/10 p-[1.5px] transition-all duration-300 group-hover:bg-gradient-to-b group-hover:from-cyan-400/80 group-hover:via-fuchsia-500/70 group-hover:to-purple-500/80 group-hover:shadow-[0_0_70px_-10px_rgba(34,211,238,0.8)]"
            >
              <div className="relative z-0 flex h-full flex-col rounded-2xl bg-[#0a0a14] p-6">
                <p className="text-sm font-medium text-white/50">
                  Pack {pack.label}
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {formatEuro(pack.priceEuros)}
                </p>
                <p className="mt-1 text-sm text-white/40">
                  {pack.credits} crédits · {formatPricePerCredit(pack)}
                </p>

                <div className="flex-1" />

                <AnimatedBuyButton
                  label="Choisir ce pack"
                  successLabel="C'est parti !"
                  href={buildPackCheckoutHref(pack.key, user?.id)}
                  className="mt-6 transition-shadow duration-300 group-hover:!shadow-[0_0_10px_2px_rgba(74,222,128,0.6),0_0_32px_-4px_rgba(34,211,238,0.85)]"
                />
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      <p className="mt-8 text-center text-xs text-white/30">
        Paiement 100 % sécurisé via Stripe.
      </p>
    </section>
  );
}
