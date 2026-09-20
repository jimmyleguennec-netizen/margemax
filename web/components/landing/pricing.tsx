"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { AnimatedBuyButton } from "@/components/ui/animated-buy-button";
import { buildPackCheckoutHref } from "@/lib/stripe-links";
import { SectionGlow } from "@/components/ui/section-glow";
import { PACKS, formatEuro, formatPricePerCredit } from "@/lib/packs";
import { GlowCard } from "@/components/ui/glow-card";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";
import {
  CheckoutConsentDialog,
  type ConsentPack,
} from "@/components/purchase/checkout-consent-dialog";

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
  const [consentPack, setConsentPack] = useState<ConsentPack | null>(null);

  return (
    <section id="pricing" className="container relative scroll-mt-20 py-20 sm:py-28">
      <SectionGlow />
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Des crédits, pas un abonnement
        </h2>
        <p className="mt-3 text-white/70">
          <span className="font-bold text-amber-300">3 crédits offerts</span>{" "}
          à l&apos;inscription. Achète uniquement ce dont tu as besoin,
          sans engagement, sans date de renouvellement.
        </p>
      </div>

      <ul className="mx-auto mb-12 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-400" />
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
            className="relative h-full"
          >
            <GlowCard className="h-full rounded-2xl">
            <div className="h-full rounded-2xl border border-white/10 bg-white/10 p-[1.5px]">
              <div className="relative z-0 flex h-full flex-col rounded-2xl bg-[#0a0a14] p-6">
                <p className="text-sm font-medium text-white/70">
                  Pack {pack.label}
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {formatEuro(pack.priceEuros)}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {pack.credits} crédits · {formatPricePerCredit(pack)}
                </p>

                <div className="flex-1" />

                <AnimatedBuyButton
                  label="Choisir ce pack"
                  successLabel="C'est parti !"
                  href={buildPackCheckoutHref(pack.key, user?.id)}
                  onIntercept={
                    user?.id
                      ? () =>
                          setConsentPack({
                            key: pack.key,
                            label: pack.label,
                            credits: pack.credits,
                            priceEuros: pack.priceEuros,
                          })
                      : undefined
                  }
                  className="mt-6"
                />
              </div>
            </div>
            </GlowCard>
          </motion.div>
        ))}
      </motion.div>

      {/* "Paiement sécurisé" seul ne prouve rien au client -- complete par
          des elements verifiables : qui encaisse reellement (Stripe, jamais
          MargeMax qui ne voit aucune donnee de carte), et un acces direct
          aux mentions legales/CGV pour verifier l'identite de l'entreprise
          facturante plutot que de se fier a un slogan. */}
      <p className="mt-8 text-center text-xs text-white/50">
        Paiement traité par Stripe — MargeMax ne stocke aucune donnée de
        carte bancaire.{" "}
        <Link href="/mentions-legales" className="underline-offset-4 hover:underline hover:text-white/70">
          Mentions légales
        </Link>{" "}
        ·{" "}
        <Link href="/cgv" className="underline-offset-4 hover:underline hover:text-white/70">
          CGV
        </Link>
      </p>

      <CheckoutConsentDialog
        pack={consentPack}
        userId={user?.id}
        onCancel={() => setConsentPack(null)}
      />
    </section>
  );
}
