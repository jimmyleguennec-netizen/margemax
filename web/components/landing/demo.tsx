"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Package, TrendingUp } from "lucide-react";

const rows = [
  { label: "Prix produit", value: "18,90 €" },
  { label: "Livraison", value: "4,50 €" },
  { label: "Frais d'importation", value: "2,30 €" },
];

export function Demo() {
  return (
    <section className="container pb-20 sm:pb-28">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Une fiche claire, pas une estimation au doigt mouillé
        </h2>
        <p className="mt-3 text-muted-foreground">
          Chaque champ affiche sa source. Dès que le total réel payé au
          checkout est retrouvé, MargeMax le confirme avec un badge vérifié.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <span className="ml-3 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
            margemax.app/recherche
          </span>
        </div>

        <div className="space-y-5 p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium leading-tight">
                Chargeur sans fil 3-en-1
              </p>
              <p className="text-sm text-muted-foreground">
                Variante sélectionnée : Noir
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            {rows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="flex items-center justify-between text-muted-foreground"
              >
                <span>{row.label}</span>
                <span className="font-medium text-foreground">{row.value}</span>
              </motion.div>
            ))}
            <div className="my-2 h-px bg-border" />
            <div className="flex items-center justify-between font-semibold">
              <span>Coût total</span>
              <span>25,70 €</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Coût vérifié
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 rounded-lg bg-primary/5 p-4"
          >
            <div>
              <p className="text-xs text-muted-foreground">Marge nette</p>
              <p className="text-xl font-bold text-primary">14,20 €</p>
              <p className="text-xs text-muted-foreground">35,6 %</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> ROI
              </p>
              <p className="text-xl font-bold text-primary">55,3 %</p>
              <p className="text-xs text-muted-foreground">
                Prix de vente : 39,90 €
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Exemple illustratif — chaque recherche affiche les données réelles du
        produit analysé.
      </p>
    </section>
  );
}
