"use client";

import { motion } from "framer-motion";
import { Calculator, ShieldCheck, BookMarked } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Calculator,
    title: "Calcul de marge instantané",
    description:
      "Prix produit, livraison et frais d'importation réels combinés pour une marge et un ROI exacts, jamais estimés au hasard.",
  },
  {
    icon: ShieldCheck,
    title: "Données vérifiées",
    description:
      "Chaque champ affiche sa source et un badge de vérification croisée avec le total réel payé au checkout.",
  },
  {
    icon: BookMarked,
    title: "Carnet & comparateur",
    description:
      "Centralisez vos favoris, comparez plusieurs fournisseurs et exportez vos analyses en un clic.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Features() {
  return (
    <section id="features" className="container py-20 sm:py-28">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tout pour sourcer avec confiance
        </h2>
        <p className="mt-3 text-muted-foreground">
          Conçu pour les vendeurs qui veulent des chiffres fiables, pas des
          approximations.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={item}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
