"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Minus,
  Square,
  Star,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import { MIconBadge } from "@/components/ui/m-icon-badge";
import { ReliabilityBadge } from "@/components/ui/reliability-badge";
import { CountUp } from "@/components/ui/count-up";
import { RgbLoader } from "@/components/ui/rgb-loader";
import { InfoTip, TIP_ROI } from "@/components/ui/info-tip";
import { demoMetrics, isDemoVerified, useLiveDemo, type LiveDemo } from "@/lib/hooks/use-live-demo";

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatPct(n: number | null): string {
  if (n === null) return "Non calculable";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
}

// Toutes les valeurs affichees viennent de l'exemple EN DIRECT (/api/demo :
// vraie analyse du produit de demonstration, cache 1 h) -- aucun chiffre
// fixe. Marge/ROI/prix conseille toujours via computeMarginEstimate(), la
// meme fonction que le dashboard.

function shippingLabel(demo: LiveDemo, shipping: number): string {
  if (shipping === 0) return "Gratuit (0,00 €)";
  return `${formatEuro(shipping)}${demo.shippingStatus === "estimated" ? " (estimés)" : ""}`;
}

/** Etat de chargement / d'indisponibilite -- jamais de faux chiffres. */
function DemoPlaceholder({ failed }: { failed: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-6 text-center text-sm text-white/60"
    >
      {failed ? (
        "L'exemple en direct est momentanément indisponible."
      ) : (
        <>
          <RgbLoader size={24} />
          Chargement de l&apos;exemple en direct…
        </>
      )}
    </div>
  );
}

function MacDemoWindow({ live }: { live: ReturnType<typeof useLiveDemo> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full"
    >
      {/* Halo neon ambiant */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/10 to-pink-500/20 opacity-60 blur-2xl"
      />

      {/* Bordure neon degradee, style carte de login */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-400/60 via-fuchsia-500/60 to-pink-500/60 p-[1.5px] shadow-[0_0_50px_-15px_rgba(217,70,239,0.5)]">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a14]">
          {/* Barre de titre style macOS -- purement decorative */}
          <div
            aria-hidden="true"
            className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-pink-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/70" />
            <span className="ml-3 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-white/60">
              margemax.app/recherche
            </span>
          </div>

          {live.status !== "ready" ? (
            <DemoPlaceholder failed={live.status === "error"} />
          ) : (
            <MacDemoBody demo={live.data} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Deuxieme fenetre de demo : PAS un "comparateur d'offres" (aucune telle
 * fonctionnalite n'existe dans le produit -- deux annonces comparees cote
 * a cote n'a jamais ete construit). Remplace par un apercu du Calculateur
 * de marge reel (onglet "Calculateur" du dashboard), alimente par les
 * couts de l'exemple en direct (/api/demo), au prix de vente conseille.
 * Les champs du vrai calculateur sont, eux, saisis par l'utilisateur : cet
 * apercu n'en reprend que la mise en page.
 */
function CalculatorDemoWindow({ live }: { live: ReturnType<typeof useLiveDemo> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      className="relative w-full"
    >
      {/* Halo neon ambiant */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-purple-500/20 opacity-60 blur-2xl"
      />

      {/* Bordure neon degradee, deux tons bleu/cyan (identite Windows) */}
      <div className="rounded-xl bg-gradient-to-r from-blue-400/60 via-cyan-400/60 to-purple-400/60 p-[1.5px] shadow-[0_0_50px_-15px_rgba(56,189,248,0.5)]">
        <div className="overflow-hidden rounded-xl bg-[#0a0a14]">
          {/* Barre de titre style Windows 11 */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] pl-4">
            <span className="truncate text-xs font-medium text-white/70">
              MargeMax — Calculateur de marge
            </span>
            <div className="flex items-center">
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                className="flex h-9 w-11 items-center justify-center text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Minus aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                className="flex h-9 w-11 items-center justify-center text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Square aria-hidden="true" className="h-3 w-3" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                className="flex h-9 w-11 items-center justify-center text-white/70 transition-colors hover:bg-red-500 hover:text-white"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {live.status !== "ready" ? (
            <DemoPlaceholder failed={live.status === "error"} />
          ) : (
            <CalculatorDemoBody demo={live.data} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Demo() {
  const live = useLiveDemo();
  return (
    <section id="demo" className="container scroll-mt-20 pb-20 sm:pb-28">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Ne calcule plus tes marges au hasard — estime tes coûts réels
          à partir des données disponibles
        </h2>
        <p className="mt-3 text-white/70">
          Chaque champ indique s&apos;il est confirmé ou estimé. Dès que
          tous les frais d&apos;une annonce sont confirmés, MargeMax
          l&apos;indique avec un badge vérifié.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <MacDemoWindow live={live} />
        <CalculatorDemoWindow live={live} />
      </div>

      <p className="mt-4 text-center text-xs text-white/50">
        Exemple en direct basé sur une véritable annonce AliExpress, actualisé
        automatiquement — chaque recherche
        affiche les données réelles au moment de l&apos;analyse.
      </p>
    </section>
  );
}

function MacDemoBody({ demo }: { demo: LiveDemo }) {
  const m = demoMetrics(demo);
  const verified = isDemoVerified(demo);
  const rows = [
    { label: "Sous-total produit", value: formatEuro(m.subtotal) },
    { label: "Frais de livraison", value: shippingLabel(demo, m.shipping) },
    {
      label: demo.importFeeStatus === "confirmed" ? "Frais d'importation" : "Frais d'importation estimés",
      value: formatEuro(m.importFee),
    },
  ];
  return (
      <div className="space-y-5 p-6 text-left">
        <div className="flex items-center gap-4">
          <MIconBadge />
          <div>
            <p className="font-medium leading-tight text-white">
              {demo.title}
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
              className="flex items-center justify-between text-white/70"
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
              <CountUp value={m.totalCost} format={formatEuro} />
            </span>
          </div>
        </div>
  
        <div className="flex flex-wrap items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className={
              verified
                ? "inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-300 shadow-[0_0_14px_-4px_rgba(74,222,128,0.7)]"
                : "inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300"
            }
          >
            {verified ? (
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            Exemple en direct — mis à jour automatiquement{verified ? "" : " · partiellement vérifié"}
          </motion.div>
        </div>
  
        {demo.rating !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/60"
          >
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-cyan-400/70" />
              {demo.rating.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/5
              {demo.reviewCount !== null ? ` (${demo.reviewCount} avis)` : ""}
            </span>
          </motion.div>
        )}

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
            <p className="flex items-center gap-1.5 text-xs text-white/60">
              Prix de vente recommandé estimé
            </p>
            <ReliabilityBadge tier={m.estimate.reliability} />
          </div>
          <p className="mt-1 text-2xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]">
            <CountUp value={m.estimate.recommendedPrice} format={formatEuro} />
          </p>
  
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <p className="flex items-center gap-1 text-[11px] text-white/60">
                <TrendingDown aria-hidden="true" className="h-3 w-3 text-pink-300" />
                Prix bas
              </p>
              <p className="text-sm font-semibold text-white">
                {formatEuro(m.estimate.lowPrice)}
              </p>
              <p className="text-[11px] text-white/60">
                Marge {formatEuro(m.estimate.marginLow)} ·{" "}
                {formatPct(m.estimate.roiLow)} ROI
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-white/60">
                <TrendingUp aria-hidden="true" className="h-3 w-3 text-cyan-300" />
                Prix haut
              </p>
              <p className="text-sm font-semibold text-white">
                {formatEuro(m.estimate.highPrice)}
              </p>
              <p className="text-[11px] text-white/60">
                Marge {formatEuro(m.estimate.marginHigh)} ·{" "}
                {formatPct(m.estimate.roiHigh)} ROI
              </p>
            </div>
          </div>
        </motion.div>
  
        <Link
          href={demo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex origin-center items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 text-sm font-semibold text-white/80 transition-all hover:scale-x-105 hover:border-cyan-400/40 hover:text-white hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.5)]"
        >
          Voir l&apos;offre sur AliExpress
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
  );
}

function CalculatorDemoBody({ demo }: { demo: LiveDemo }) {
  const m = demoMetrics(demo);
  return (
        <div className="space-y-4 p-6 text-left">
          <p className="text-sm text-white/70">
            Simule tes propres coûts et découvre ta marge et ton
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
            <div className="flex items-center justify-between text-white/70">
              <span>Prix produit</span>
              <span className="font-medium text-white">{formatEuro(m.subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-white/70">
              <span>Livraison</span>
              <span className="font-medium text-white">{formatEuro(m.shipping)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-white/70">
              <span>Taxes / import</span>
              <span className="font-medium text-white">{formatEuro(m.importFee)}</span>
            </div>
            <div className="my-2 h-px bg-white/10" />
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Coût total</span>
              <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                {formatEuro(m.totalCost)}
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
              <p className="text-xs text-white/60">Marge</p>
              <p className="mt-1 text-lg font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                <CountUp value={m.sale.marginBeforeAds} format={formatEuro} />
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60">Marge %</p>
              <p className="mt-1 text-lg font-bold text-white">
                {formatPct(m.sale.marginRatePct)}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-white/60">
                <TrendingUp aria-hidden="true" className="h-3 w-3" />
                <InfoTip text={TIP_ROI} align="right">ROI</InfoTip>
              </p>
              <p className="mt-1 text-lg font-bold text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]">
                <CountUp value={m.sale.roiPct ?? 0} format={formatPct} />
              </p>
            </div>
          </motion.div>
  
          <p className="text-center text-[11px] text-white/60">
            Prix de vente testé : {formatEuro(m.sale.salePrice)} — librement
            modifiable dans le vrai calculateur, sans limite d&apos;essais.
          </p>
        </div>
  );
}
