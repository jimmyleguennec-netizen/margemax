"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  CheckCircle2,
  Link2,
  Search,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CountUp } from "@/components/ui/count-up";
import { ReliabilityBadge } from "@/components/ui/reliability-badge";
import { SectionGlow } from "@/components/ui/section-glow";
import { computeMarginEstimate, computeSaleMetrics } from "@/lib/margin-estimate";

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatPct(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
}

// Memes chiffres d'exemple que components/landing/demo.tsx (voir son
// commentaire) : jamais une marge/ROI/fiabilite recalculee ou inventee a
// la main ici, toujours computeMarginEstimate(), la fonction partagee
// reellement utilisee par le Calculateur et la Recherche du dashboard.
// L'ancien "Indice de fiabilité : 94 %" etait un pourcentage fixe sans
// methode reelle derriere (la vraie fiabilite est qualitative -- eleve/
// moyen/faible -- voir lib/margin-estimate.ts, reliabilityTierFromImportRatio) :
// remplace par le meme badge ReliabilityBadge que l'app reelle.
const SUBTOTAL = 14.49;
const IMPORT_FEE = 3.6;
const TOTAL_COST = SUBTOTAL + IMPORT_FEE;
const MARGIN_EXAMPLE = computeMarginEstimate(TOTAL_COST, IMPORT_FEE);

const guideSteps: {
  id: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "recherche",
    icon: Search,
    label: "1. Recherche",
    title: "Saisis un mot-clé ou colle l'URL d'une annonce AliExpress",
    description:
      "Fonctionne avec un simple mot-clé (ex. « chargeur induction ») ou un lien produit direct.",
  },
  {
    id: "analyse",
    icon: Calculator,
    label: "2. Analyse",
    title: "Analyse instantanée des prix, livraison et taxes d'importation",
    description:
      "Chaque coût est extrait réellement au checkout, avec un statut confirmé, estimé ou indisponible.",
  },
  {
    id: "marge",
    icon: CheckCircle2,
    label: "3. Marge",
    title: "Découverte de la marge avant publicité et autres frais, et de l'indice de fiabilité",
    description:
      "Marge, ROI et un score de fiabilité qui diminue quand la part de frais estimés (non confirmés au checkout) augmente.",
  },
  {
    id: "decision",
    icon: TrendingUp,
    label: "4. Décision",
    title: "Prends ta décision avec les vrais chiffres",
    description:
      "Valide ton produit avec ton prix conseillé et lance ta vente en toute confiance.",
  },
];

function SearchVisual() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-white/5 px-3 py-2.5 text-xs text-white/70">
        <Link2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
        <span className="truncate">chargeur à induction pour iPhone</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-cyan-300/80">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        Exemple de recherche
      </div>
    </div>
  );
}

const ANALYZE_ROWS = [
  { label: "Sous-total", value: 14.49 },
  { label: "Livraison", value: 0 },
  { label: "Taxes", value: 3.6 },
];

function AnalyzeVisual() {
  return (
    <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">
      <div className="relative h-1 overflow-hidden rounded-full bg-white/5">
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-cyan-400/60" />
      </div>
      {ANALYZE_ROWS.map((row, i) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.15, duration: 0.3 }}
          className="flex items-center justify-between text-white/70"
        >
          <span>{row.label}</span>
          <span className="font-medium text-white">
            {row.value === 0 ? "Gratuit" : <CountUp value={row.value} format={formatEuro} duration={0.6} />}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function MarginVisual() {
  return (
    <div className="mt-4 space-y-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] p-3">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-white/60">Marge avant pub (prix conseillé)</p>
          <p className="text-lg font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            <CountUp value={MARGIN_EXAMPLE.marginHigh} format={formatEuro} />
          </p>
          <p className="text-xs text-white/60">
            ROI{" "}
            {MARGIN_EXAMPLE.roiHigh !== null ? (
              <CountUp value={MARGIN_EXAMPLE.roiHigh} format={formatPct} />
            ) : (
              "non calculable"
            )}
          </p>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span>Fiabilité</span>
          <ReliabilityBadge tier={MARGIN_EXAMPLE.reliability} />
        </div>
        <p className="mt-1.5 text-[10px] text-white/50">
          Exemple illustratif — palier qualitatif, pas un pourcentage
          précis ni une donnée de marché garantie.
        </p>
      </div>
    </div>
  );
}

// Meme exemple que les cartes 2 et 3 : prix conseille et marge issus des
// fonctions partagees (computeMarginEstimate / computeSaleMetrics), pas de
// chiffres ecrits a la main. "Marge avant pub" (et non "nette") : le calcul
// ne deduit ni publicite ni frais de transaction ni impots.
const DECISION_METRICS = computeSaleMetrics(TOTAL_COST, MARGIN_EXAMPLE.recommendedPrice);
const DECISION_IS_PROFITABLE = DECISION_METRICS.marginBeforeAds > 0;

function DecisionVisual() {
  return (
    <div className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] p-3 text-xs shadow-[0_0_14px_-4px_rgba(34,211,238,0.5)]">
      <p className="flex items-center gap-1.5 font-semibold text-white">
        <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-cyan-300" />
        {DECISION_IS_PROFITABLE ? "Produit rentable" : "Produit non rentable"}
      </p>
      <dl className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/60">Marge avant pub</dt>
          <dd className="font-semibold text-cyan-300">
            {formatEuro(DECISION_METRICS.marginBeforeAds)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/60">Prix conseillé</dt>
          <dd className="font-semibold text-white">
            {formatEuro(MARGIN_EXAMPLE.recommendedPrice)}
          </dd>
        </div>
      </dl>
      <p className="mt-2.5 text-[10px] text-white/50">
        Exemple illustratif — tes chiffres dépendent du produit analysé.
      </p>
    </div>
  );
}

const visuals: Record<string, () => JSX.Element> = {
  recherche: SearchVisual,
  analyse: AnalyzeVisual,
  marge: MarginVisual,
  decision: DecisionVisual,
};

export function QuickGuide() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Carrousel (< lg) : l'indicateur suit la carte la plus proche du bord
  // gauche ; sur la derniere carte (defilement en butee) on force le
  // dernier point, sinon une carte plus etroite que le pas ne l'atteindrait
  // jamais. Sur lg+, la liste est une grille : l'etat est simplement ignore.
  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return;
    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement | undefined;
    const stride = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    if (stride <= 0) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const next = atEnd
      ? guideSteps.length - 1
      : Math.min(guideSteps.length - 1, Math.max(0, Math.round(track.scrollLeft / stride)));
    setActiveIndex(next);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActive);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [syncActive]);

  function goTo(index: number) {
    const card = trackRef.current?.children[index] as HTMLElement | undefined;
    if (!card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  return (
    <section id="guide" className="container relative scroll-mt-20 py-20 sm:py-28">
      <SectionGlow />
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Prends en main l&apos;outil en 30 secondes
        </h2>
        <p className="mt-3 text-white/70">
          Le parcours complet, du compte gratuit à la décision d&apos;achat.
        </p>
      </div>

      {/* Mobile/tablette : carrousel horizontal tactile (scroll-snap natif,
          donc fluide au doigt et sans JS pour le glissement). Desktop (lg+) :
          grille 4 colonnes, les 4 etapes visibles d'un coup, sans defilement. */}
      <ul
        ref={trackRef}
        aria-label="Les 4 étapes pour analyser un produit"
        className="-mx-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-8 px-8 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-auto lg:grid lg:max-w-6xl lg:snap-none lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {guideSteps.map((step, index) => {
          const Visual = visuals[step.id];
          return (
            <li
              key={step.id}
              aria-label={`Étape ${index + 1} sur ${guideSteps.length}`}
              className="flex w-[82%] shrink-0 snap-center flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:w-[46%] lg:w-auto lg:shrink"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 text-cyan-300">
                  <step.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  {step.label}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-white/70">{step.description}</p>
              <div className="mt-auto pt-1">
                <Visual />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex justify-center gap-2 lg:hidden">
        {guideSteps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Aller à l'étape ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span
              className={cn(
                "h-2 rounded-full bg-cyan-300 transition-all duration-300",
                index === activeIndex ? "w-6 opacity-100" : "w-2 opacity-40"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
