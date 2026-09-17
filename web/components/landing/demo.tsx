"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  Minus,
  Square,
  Star,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";

import { MIconBadge } from "@/components/ui/m-icon-badge";
import { CountUp } from "@/components/ui/count-up";

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatPct(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
}

const PRODUCT_URL = "https://fr.aliexpress.com/item/1005006478208156.html";

const rows = [
  { label: "Sous-total produit", value: "14,49 €" },
  { label: "Frais de livraison", value: "Gratuit (0,00 €)" },
  { label: "Frais d'importation estimés", value: "3,60 €" },
];

const reliability = [
  { icon: Star, label: "3,9/5 (47 vendus)" },
  { icon: Truck, label: "Colissimo / Colis Privé" },
];

const offers = [
  {
    name: "Offre n° 1 — Sélection MargeMax",
    price: "18,09 €",
    marge: "21,81 €",
    margePct: "120,6 % ROI",
    best: true,
  },
  {
    name: "Offre n° 2 — Annonce alternative",
    price: "24,90 €",
    marge: "15,00 €",
    margePct: "60,2 % ROI",
    best: false,
  },
];

function MacDemoWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative w-full"
    >
      {/* Halo neon ambiant */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/10 to-pink-500/20 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Bordure neon degradee, style carte de login */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-400/60 via-fuchsia-500/60 to-pink-500/60 p-[1.5px] shadow-[0_0_50px_-15px_rgba(217,70,239,0.5)] transition-shadow duration-500 group-hover:shadow-[0_0_60px_-10px_rgba(34,211,238,0.6)]">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a14]">
          {/* Scanner laser -- balayage vertical simulant l'analyse IA */}
          <motion.div
            aria-hidden
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-x-0 z-20 h-12 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent"
          />
          <motion.div
            aria-hidden
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-x-0 z-20 h-px bg-cyan-300 shadow-[0_0_12px_3px_rgba(34,211,238,0.9)]"
          />

          {/* Barre de titre style macOS */}
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/70" />
            <span className="ml-3 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-white/40">
              margemax.app/recherche
            </span>
          </div>

          <div className="space-y-5 p-6 text-left">
            <div className="flex items-center gap-4">
              <MIconBadge />
              <div>
                <p className="font-medium leading-tight text-white">
                  Station de charge sans fil 3-en-1 pliable
                </p>
                <p className="text-sm text-white/40">
                  Compatible iPhone / Watch / AirPods
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
                <span className="uppercase tracking-wide">
                  Total réel checkout
                </span>
                <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                  <CountUp value={18.09} format={formatEuro} />
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-300 shadow-[0_0_14px_-4px_rgba(74,222,128,0.7)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Exemple de résultat
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/40"
            >
              {reliability.map((r) => (
                <span key={r.label} className="flex items-center gap-1.5">
                  <r.icon className="h-3.5 w-3.5 text-cyan-400/70" />
                  {r.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="grid grid-cols-2 gap-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] p-4"
            >
              <div>
                <p className="text-xs text-white/40">Marge avant publicité et autres frais</p>
                <p className="text-xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                  <CountUp value={21.81} format={formatEuro} />
                </p>
                <p className="text-xs text-white/40">54,7 %</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs text-white/40">
                  <TrendingUp className="h-3.5 w-3.5" /> ROI
                </p>
                <p className="text-xl font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]">
                  <CountUp value={120.6} format={formatPct} />
                </p>
                <p className="text-xs text-white/40">
                  Prix de vente conseillé : 39,90 €
                </p>
              </div>
            </motion.div>

            <Link
              href={PRODUCT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex origin-center items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 text-sm font-semibold text-white/80 transition-all hover:scale-x-105 hover:border-cyan-400/40 hover:text-white hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.5)]"
            >
              Voir l&apos;offre sur AliExpress
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WindowsDemoWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      className="group relative w-full"
    >
      {/* Halo neon ambiant */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-purple-500/20 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Bordure neon degradee, deux tons bleu/cyan (identite Windows) */}
      <div className="rounded-xl bg-gradient-to-r from-blue-400/60 via-cyan-400/60 to-purple-400/60 p-[1.5px] shadow-[0_0_50px_-15px_rgba(56,189,248,0.5)] transition-shadow duration-500 group-hover:shadow-[0_0_60px_-10px_rgba(56,189,248,0.6)]">
        <div className="overflow-hidden rounded-xl bg-[#0a0a14]">
          {/* Barre de titre style Windows 11 */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] pl-4">
            <span className="truncate text-xs font-medium text-white/50">
              MargeMax — Comparateur d&apos;offres AliExpress
            </span>
            <div className="flex items-center">
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                className="flex h-9 w-11 items-center justify-center text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                className="flex h-9 w-11 items-center justify-center text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Square className="h-3 w-3" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                className="flex h-9 w-11 items-center justify-center text-white/50 transition-colors hover:bg-red-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 p-6 text-left">
            <p className="text-sm text-white/50">
              Même produit, deux annonces AliExpress — MargeMax classe
              automatiquement le meilleur ROI.
            </p>

            <div className="space-y-3">
              {offers.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                  className={`relative rounded-lg border p-4 text-sm ${
                    s.best
                      ? "border-cyan-400/40 bg-cyan-400/[0.06] shadow-[0_0_20px_-6px_rgba(34,211,238,0.6)]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {s.best && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-[0_0_10px_-1px_rgba(34,211,238,0.8)]">
                      Meilleur ROI
                    </span>
                  )}
                  <div className="flex items-center justify-between font-medium text-white">
                    <span>{s.name}</span>
                    <span className="text-white/50">{s.price}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-white/40">Marge avant pub</span>
                    <span
                      className={
                        s.best
                          ? "font-semibold text-cyan-300"
                          : "font-medium text-white/70"
                      }
                    >
                      {s.marge}{" "}
                      <span className="text-xs text-white/40">
                        ({s.margePct})
                      </span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Demo() {
  return (
    <section id="demo" className="container scroll-mt-20 pb-20 sm:pb-28">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Une fiche claire, pas une estimation au doigt mouillé
        </h2>
        <p className="mt-3 text-white/50">
          Chaque champ affiche sa source. Dès que le total réel payé au
          checkout est retrouvé, MargeMax le confirme avec un badge vérifié.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <MacDemoWindow />
        <WindowsDemoWindow />
      </div>

      <p className="mt-4 text-center text-xs text-white/30">
        Exemple basé sur une véritable annonce AliExpress — chaque recherche
        affiche les données réelles au moment de l&apos;analyse.
      </p>
    </section>
  );
}
