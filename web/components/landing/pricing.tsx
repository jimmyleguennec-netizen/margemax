"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Des crédits, pas un abonnement
        </h2>
        <p className="mt-3 text-muted-foreground">
          3 crédits offerts à l&apos;inscription. Achetez uniquement ce dont
          vous avez besoin, sans engagement, sans date de renouvellement.
        </p>
      </div>

      <ul className="mx-auto mb-12 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <Check className="h-4 w-4 shrink-0 text-primary" />
            {b}
          </li>
        ))}
      </ul>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        {packs.map((pack) => (
          <motion.div key={pack.key} variants={item}>
            <Card
              className={cn(
                "relative flex h-full flex-col",
                pack.popular && "border-primary shadow-md ring-1 ring-primary"
              )}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Le plus populaire
                </span>
              )}
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">
                  Pack {pack.label}
                </p>
                <p className="text-3xl font-bold">{pack.price}</p>
                <p className="text-sm text-muted-foreground">
                  {pack.credits} crédits · {pack.perCredit}
                </p>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <Button
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/signup">Choisir ce pack</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Paiement 100 % sécurisé via Stripe. Créez votre compte pour acheter un
        pack de crédits.
      </p>
    </section>
  );
}
