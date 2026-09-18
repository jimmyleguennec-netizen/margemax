"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  Minus,
  Sparkles,
  Square,
  Star,
  TrendingDown,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";

import { MIconBadge } from "@/components/ui/m-icon-badge";
import { ReliabilityBadge } from "@/components/ui/reliability-badge";
import { CountUp } from "@/components/ui/count-up";
import { computeMarginEstimate } from "@/lib/margin-estimate";

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatPct(n: number | null): string {
  if (n === null) return "Non calculable";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
}

const PRODUCT_URL = "https://fr.aliexpress.com/item/1005006478208156.html";

// Memes chiffres d'exemple partout dans l'app pour rester coherent : la
// recherche exemple du dashboard (search-panel.tsx buildExampleResult) ET
// les valeurs par defaut du Calculateur de marge reel (calculator-panel.tsx,
// prix produit/livraison/taxes/prix de vente) utilisent deja exactement
// ces memes chiffres -- jamais une marge/ROI recalculee ou arrondie a la
// main ici, toujours computeMarginEstimate(), la meme fonction partagee
// que les deux pages reelles.
const SUBTOTAL = 14.49;
const SHIPPING = 0;
const IMPORT_FEE = 3.6;
const TOTAL_COST = SUBTOTAL + SHIPPING + IMPORT_FEE;
const SALE_PRICE = 29.9; // valeur par defaut du champ "Prix de vente (manuel)" du vrai Calculateur
const MARGIN = SALE_PRICE - TOTAL_COST;
const MARGIN_PCT = (MARGIN / SALE_PRICE) * 100;
const ROI_PCT = (MARGIN / TOTAL_COST) * 100;
const PRICE_ESTIMATE = computeMarginEstimate(TOTAL_COST, IMPORT_FEE);

const rows = [
  { label: "Sous-total produit", value: formatEuro(SUBTOTAL) },
  { label: "Frais de livraison", value: "Gratuit (0,00 €)" },
  { label: "Frais d'importation estimés", value: formatEuro(IMPORT_FEE) },
];

const reliability = [
  { icon: Star, label: "3,9/5 (47 avis)" },
  { icon: Truck, label: "Colissimo / Colis Privé" },
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

          {/* Barre de titre style macOS -- purement decorative */}
          <div
            aria-hidden="true"
            className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3"
          >
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
                  Coût total estimé
                </span>
                <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                  <CountUp value={TOTAL_COST} format={formatEuro} />
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

            {/* Prix de vente recommande -- meme presentation que le vrai
                bloc d'estimation (EstimateBlock dans search-panel.tsx) :
                prix conseille en avant, fourchette basse/haute avec marge
                et ROI en dessous, meme fonction de calcul. */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs text-white/40">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Prix de vente recommandé estimé
                </p>
                <ReliabilityBadge tier={PRICE_ESTIMATE.reliability} />
              </div>
              <p className="mt-1 text-2xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]">
                <CountUp value={PRICE_ESTIMATE.recommendedPrice} format={formatEuro} />
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <div>
                  <p className="flex items-center gap-1 text-[11px] text-white/40">
                    <TrendingDown className="h-3 w-3 text-pink-300" />
                    Prix bas
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {formatEuro(PRICE_ESTIMATE.lowPrice)}
                  </p>
                  <p className="text-[11px] text-white/40">
                    Marge {formatEuro(PRICE_ESTIMATE.marginLow)} ·{" "}
                    {formatPct(PRICE_ESTIMATE.roiLow)} ROI
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-[11px] text-white/40">
                    <TrendingUp className="h-3 w-3 text-cyan-300" />
                    Prix haut
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {formatEuro(PRICE_ESTIMATE.highPrice)}
                  </p>
                  <p className="text-[11px] text-white/40">
                    Marge {formatEuro(PRICE_ESTIMATE.marginHigh)} ·{" "}
                    {formatPct(PRICE_ESTIMATE.roiHigh)} ROI
                  </p>
                </div>
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

/**
 * Deuxieme fenetre de demo : PAS un "comparateur d'offres" (aucune telle
 * fonctionnalite n'existe dans le produit -- deux annonces comparees cote
 * a cote n'a jamais ete construit). Remplace par un apercu fidele du
 * Calculateur de marge reel (onglet "Calculateur" du dashboard), sur les
 * MEMES valeurs par defaut que ce dernier (calculator-panel.tsx : prix
 * produit 14,49 €, livraison 0 €, taxes 3,60 €, prix de vente manuel
 * 29,90 €) -- ce que cette fenetre affiche est exactement ce qu'un
 * visiteur voit en ouvrant cet onglet pour la premiere fois.
 */
function CalculatorDemoWindow() {
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
              MargeMax — Calculateur de marge
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
              Simulez vos propres coûts et découvrez votre marge et votre
              ROI en temps réel — utilisable à volonté, sans consommer de
              crédit.
            </p>

            <motion.div
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm"
            >
              <div className="flex items-center justify-between text-white/50">
                <span>Prix produit</span>
                <span className="font-medium text-white">{formatEuro(SUBTOTAL)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-white/50">
                <span>Livraison</span>
                <span className="font-medium text-white">{formatEuro(SHIPPING)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-white/50">
                <span>Taxes / import</span>
                <span className="font-medium text-white">{formatEuro(IMPORT_FEE)}</span>
              </div>
              <div className="my-2 h-px bg-white/10" />
              <div className="flex items-center justify-between font-semibold text-white">
                <span>Coût total</span>
                <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                  {formatEuro(TOTAL_COST)}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32, duration: 0.4 }}
              className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm"
            >
              <div>
                <p className="text-xs text-white/40">Marge</p>
                <p className="mt-1 text-lg font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                  <CountUp value={MARGIN} format={formatEuro} />
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Marge %</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {formatPct(MARGIN_PCT)}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs text-white/40">
                  <TrendingUp className="h-3 w-3" /> ROI
                </p>
                <p className="mt-1 text-lg font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]">
                  <CountUp value={ROI_PCT} format={formatPct} />
                </p>
              </div>
            </motion.div>

            <p className="text-center text-[11px] text-white/40">
              Prix de vente testé : {formatEuro(SALE_PRICE)} — librement
              modifiable dans le vrai calculateur, sans limite d&apos;essais.
            </p>
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
          Chaque champ indique s&apos;il est confirmé ou estimé. Dès que
          tous les frais d&apos;une annonce sont confirmés, MargeMax
          l&apos;indique avec un badge vérifié.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <MacDemoWindow />
        <CalculatorDemoWindow />
      </div>

      <p className="mt-4 text-center text-xs text-white/30">
        Exemple basé sur une véritable annonce AliExpress — chaque recherche
        affiche les données réelles au moment de l&apos;analyse.
      </p>
    </section>
  );
}
