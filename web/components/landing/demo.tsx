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
    <section id="demo" className="container pb-20 sm:pb-28">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Une fiche claire, pas une estimation au doigt mouillé
        </h2>
        <p className="mt-3 text-white/50">
          Chaque champ affiche sa source. Dès que le total réel payé au
          checkout est retrouvé, MargeMax le confirme avec un badge vérifié.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -6 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="group relative mx-auto max-w-lg"
      >
        {/* Halo neon ambiant */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/10 to-pink-500/20 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Bordure neon degradee, style carte de login */}
        <div className="rounded-2xl bg-gradient-to-r from-cyan-400/60 via-fuchsia-500/60 to-pink-500/60 p-[1.5px] shadow-[0_0_50px_-15px_rgba(217,70,239,0.5)] transition-shadow duration-500 group-hover:shadow-[0_0_60px_-10px_rgba(34,211,238,0.6)]">
          <div className="overflow-hidden rounded-2xl bg-[#0a0a14]">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-pink-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/70" />
              <span className="ml-3 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-white/40">
                margemax.app/recherche
              </span>
            </div>

            <div className="space-y-5 p-6 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Package className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <p className="font-medium leading-tight text-white">
                    Chargeur sans fil 3-en-1
                  </p>
                  <p className="text-sm text-white/40">
                    Variante sélectionnée : Noir
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
                {rows.map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between text-white/50"
                  >
                    <span>{row.label}</span>
                    <span className="font-medium text-white">{row.value}</span>
                  </motion.div>
                ))}
                <div className="my-2 h-px bg-white/10" />
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Coût total</span>
                  <span>25,70 €</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-300 shadow-[0_0_14px_-4px_rgba(74,222,128,0.7)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Coût vérifié
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="grid grid-cols-2 gap-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] p-4"
              >
                <div>
                  <p className="text-xs text-white/40">Marge nette</p>
                  <p className="text-xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                    14,20 €
                  </p>
                  <p className="text-xs text-white/40">35,6 %</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-white/40">
                    <TrendingUp className="h-3.5 w-3.5" /> ROI
                  </p>
                  <p className="text-xl font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]">
                    55,3 %
                  </p>
                  <p className="text-xs text-white/40">
                    Prix de vente : 39,90 €
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="mt-4 text-center text-xs text-white/30">
        Exemple illustratif — chaque recherche affiche les données réelles du
        produit analysé.
      </p>
    </section>
  );
}
