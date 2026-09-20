"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ExternalLink,
  Link2,
  Search,
  Send,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { RgbLoader } from "@/components/ui/rgb-loader";
import { ProductThumbnail } from "@/components/ui/product-thumbnail";
import { ReliabilityBadge } from "@/components/ui/reliability-badge";
import { CountUp } from "@/components/ui/count-up";
import { computeMarginEstimate } from "@/lib/margin-estimate";

type Status = "idle" | "loading" | "result" | "error";

type FieldStatus = "confirmed" | "estimated" | "missing";

type ApiResult = {
  title: string;
  variant: string | null;
  variantStatus: FieldStatus;
  url: string;
  product_image_url: string | null;
  subtotal: number | null;
  shipping: number | null;
  shippingStatus: FieldStatus;
  importFee: number | null;
  importFeeStatus: FieldStatus;
  /** total REEL, null des qu'un seul champ (livraison, taxe, variante)
   * n'est pas confirme -- ne jamais afficher comme "Coût total" quand
   * null : voir partialTotal/isComplete. */
  total: number | null;
  /** toujours calculable (frais inconnus comptes pour 0 dans CE calcul
   * uniquement) -- a afficher sous un libelle explicitement partiel,
   * jamais sous "Coût total". */
  partialTotal: number;
  isComplete: boolean;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  destination: string;
  analyzedAt: string;
  creditsDebited?: boolean;
  credits?: number;
  /** true pour l'exemple illustratif ("Voir une analyse exemple", aucun
   * appel reseau ni credit consomme) -- jamais pour une vraie analyse. */
  isExample?: boolean;
};

const EXAMPLE_QUERY = "chargeur à induction pour iPhone";

// Suggestions de mots-cles populaires -- remplissent le champ de
// recherche au clic (jamais de soumission automatique : une analyse
// coute un credit, l'utilisateur doit rester libre de relire/modifier
// avant de lancer).
const POPULAR_KEYWORDS = [
  "chargeur induction",
  "nettoyant voiture",
  "écouteurs sans fil",
  "lampe led chambre",
  "support téléphone voiture",
];

/**
 * Donnees fixes, non recuperees en direct -- memes chiffres que la
 * demonstration de la landing page (components/landing/demo.tsx), pour
 * ne jamais promettre un appel reseau reel gratuit illimite (couteux,
 * facture au fournisseur) alors qu'un exemple statique suffit a montrer
 * le fonctionnement.
 */
function buildExampleResult(): ApiResult {
  return {
    title: "Station de charge sans fil 3-en-1 pliable",
    // Exemple statique volontairement complet (tous les champs confirmes)
    // pour illustrer le cas ideal -- un vrai résultat peut être partiel,
    // voir le badge "Partiellement vérifié" documenté plus bas.
    variant: "Blanc",
    variantStatus: "confirmed",
    url: "https://fr.aliexpress.com/item/1005006478208156.html",
    // Asset statique reel (public/images/product-charger.jpg), pas une URL
    // AliExpress -- jamais recuperee en direct, voir commentaire ci-dessus.
    product_image_url: "/images/product-charger.jpg",
    subtotal: 14.49,
    shipping: 0,
    shippingStatus: "confirmed",
    importFee: 3.6,
    importFeeStatus: "confirmed",
    total: 18.09,
    partialTotal: 18.09,
    isComplete: true,
    currency: "EUR",
    // Memes chiffres que la demonstration de la landing (demo.tsx) : "3,9/5
    // (47 vendus)".
    rating: 3.9,
    reviewCount: 47,
    destination: "France",
    analyzedAt: new Date().toISOString(),
    isExample: true,
  };
}

function formatAnalyzedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function formatEuro(n: number | null): string {
  if (n === null) return "—";
  if (n === 0) return "Gratuit (0,00 €)";
  return (
    n.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

const STATUS_LABEL: Record<FieldStatus, string> = {
  confirmed: "confirmé",
  estimated: "estimé (TVA 20 %)",
  missing: "manquant",
};

const STATUS_CLASS: Record<FieldStatus, string> = {
  confirmed: "text-green-300/70",
  estimated: "text-cyan-300/70",
  missing: "text-amber-300/70",
};

function StatusTag({ status }: { status: FieldStatus }) {
  return (
    <span className={`text-[10px] uppercase tracking-wide ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/** null (non calculable, denominateur nul) -> "Non calculable", jamais 0 %. */
function formatPct(n: number | null): string {
  if (n === null) return "Non calculable";
  return (
    n.toLocaleString("fr-FR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " %"
  );
}

function EstimateBlock({
  total,
  partialTotal,
  isComplete,
  importFee,
}: {
  total: number | null;
  partialTotal: number;
  isComplete: boolean;
  importFee: number | null;
}) {
  // Marge/ROI/prix conseillé/budget pub calcules a partir du cout partiel
  // quand le cout reel n'est pas confirme -- JAMAIS masques (l'utilisateur
  // a paye un credit pour cette analyse), mais marques "incomplets" de
  // façon visible plutot que presentes comme fiables. Voir isComplete dans
  // lib/aliexpress-search.ts.
  const basis = total ?? partialTotal;
  const estimate = computeMarginEstimate(basis, importFee);

  return (
    <div className="border-t border-cyan-400/20 bg-cyan-400/[0.05] p-5">
      {!isComplete && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Estimation <strong>incomplète</strong> : calculée à partir du
            coût partiel (certains frais restent manquants ou estimés).
            Marge, ROI, prix conseillé et budget pub ci-dessous peuvent
            s&apos;écarter du coût réel.
          </span>
        </div>
      )}
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-white/40">
            Prix de vente recommandé estimé
            {!isComplete && (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                incomplet
              </span>
            )}
          </p>
          <p className="mt-1 text-2xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]">
            <CountUp value={estimate.recommendedPrice} format={formatEuro} />
          </p>
        </div>
        <ReliabilityBadge tier={estimate.reliability} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="flex items-center gap-1.5 text-xs text-white/40">
            <TrendingDown className="h-3.5 w-3.5 text-pink-300" />
            Prix de vente bas (fourchette prudente)
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            <CountUp value={estimate.lowPrice} format={formatEuro} />
          </p>
          <p className="mt-1 text-xs text-white/40">
            Marge {formatEuro(estimate.marginLow)} ·{" "}
            {formatPct(estimate.roiLow)} ROI
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="flex items-center gap-1.5 text-xs text-white/40">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-300" />
            Prix de vente haut (fourchette premium)
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            <CountUp value={estimate.highPrice} format={formatEuro} />
          </p>
          <p className="mt-1 text-xs text-white/40">
            Marge {formatEuro(estimate.marginHigh)} ·{" "}
            {formatPct(estimate.roiHigh)} ROI
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/[0.05] px-4 py-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-white/50">
            Budget pub maximum par vente (TikTok/Meta)
            {!isComplete && (
              <span className="ml-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                incomplet
              </span>
            )}
          </span>
          <span className="font-bold text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]">
            <CountUp value={Math.max(0, estimate.marginHigh)} format={formatEuro} />
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-white/40">
          Ne déduit ni frais de transaction (Stripe, PayPal...), ni
          commissions publicitaires, ni impôts sur le profit — à
          soustraire vous-même avant de fixer un budget réel.
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] text-white/40">
        {isComplete
          ? "Estimation calculée à partir du coût total confirmé de cette annonce — "
          : "Estimation calculée à partir du coût partiel de cette annonce (voir le détail ci-dessus) — "}
        pas une donnée de marché garantie. Méthode : prix conseillé = coût ×
        1,8, arrondi au 0,90 € psychologique le plus proche. La fiabilité
        est qualitative, pas un pourcentage : elle diminue quand les frais
        d&apos;importation pèsent lourd dans le coût total.
      </p>
    </div>
  );
}

export function SearchPanel({
  credits,
  onCreditsChange,
  onResult,
}: {
  credits?: number | null;
  onCreditsChange?: (credits: number) => void;
  onResult?: (entry: {
    id: string;
    query: string;
    title: string;
    total: number | null;
    partialTotal: number;
    isComplete: boolean;
    url: string;
    timestamp: number;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPlane, setShowPlane] = useState(false);
  const [justSucceeded, setJustSucceeded] = useState(false);
  const shakeControls = useAnimation();

  useEffect(() => {
    if (status === "error") {
      shakeControls.start({
        x: [0, -8, 8, -6, 6, -2, 2, 0],
        transition: { duration: 0.45 },
      });
    }
  }, [status, shakeControls]);

  async function runAnalysis(trimmed: string) {
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);
    setShowPlane(true);
    window.setTimeout(() => setShowPlane(false), 550);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          response.status === 402
            ? data?.error ?? "Solde de crédits insuffisant."
            : data?.error ?? "L'analyse a échoué — réessayez dans un instant."
        );
        setStatus("error");
        // Aucun credit debite sur un echec (garanti cote serveur) -- mais
        // si le serveur precise le solde exact (ex. 402), on le reflete
        // quand meme pour rester coherent avec l'affichage.
        if (typeof data?.credits === "number") onCreditsChange?.(data.credits);
        return;
      }

      const apiResult = data as ApiResult;
      setResult(apiResult);
      setStatus("result");
      setJustSucceeded(true);
      window.setTimeout(() => setJustSucceeded(false), 1400);

      if (typeof apiResult.credits === "number") {
        onCreditsChange?.(apiResult.credits);
      }

      onResult?.({
        id: `${Date.now()}`,
        query: trimmed,
        title: apiResult.title,
        total: apiResult.total,
        partialTotal: apiResult.partialTotal,
        isComplete: apiResult.isComplete,
        url: apiResult.url,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("[SearchPanel] Échec de l'appel /api/analyze :", err);
      setErrorMessage(
        "Impossible de contacter le service d'analyse — réessayez dans un instant."
      );
      setStatus("error");
    }
  }

  function showExample() {
    if (status === "loading") return;
    setErrorMessage(null);
    setResult(buildExampleResult());
    setStatus("result");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runAnalysis(query.trim());
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {status === "idle" && (
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Analysez votre prochain produit
          </h1>
          {typeof credits === "number" && (
            <p className="flex items-center gap-1.5 text-sm text-cyan-300">
              <Zap className="h-4 w-4" />
              {credits} crédit{credits > 1 ? "s" : ""} disponible
              {credits > 1 ? "s" : ""}
            </p>
          )}
          <button
            type="button"
            onClick={showExample}
            className="mt-1 text-xs font-medium text-cyan-300/80 underline-offset-4 hover:underline"
          >
            Voir une analyse exemple (aucun crédit utilisé)
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {POPULAR_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => setQuery(keyword)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 transition-all hover:border-cyan-400/40 hover:text-white"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
      >
        <label
          htmlFor="search-query"
          className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
        >
          Mots-clés ou lien AliExpress
        </label>
        <motion.div animate={shakeControls} className="relative mt-2 flex items-center gap-2">
          <div className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
            <input
              id="search-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ex : chargeur à induction pour iPhone, ou aliexpress.com/item/..."
              className={`w-full min-w-0 rounded-lg border bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition-all ${
                status === "error"
                  ? "border-pink-500/60 shadow-[0_0_20px_-2px_rgba(244,63,94,0.6)]"
                  : "border-cyan-400/20 focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || !query.trim() || credits === 0}
            className="relative flex min-w-[128px] shrink-0 origin-center items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.8)] transition-all duration-300 [@media(hover:hover)]:hover:scale-x-105 hover:bg-[position:100%_0] hover:shadow-[0_0_28px_-2px_rgba(34,211,238,0.9)] disabled:cursor-not-allowed disabled:opacity-50 [@media(hover:hover)]:disabled:hover:scale-x-100"
          >
            <AnimatePresence mode="wait" initial={false}>
              {showPlane ? (
                <motion.span
                  key="flying"
                  initial={{ x: 0, opacity: 1, rotate: 0 }}
                  animate={{ x: 40, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.5, ease: "easeIn" }}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Analyser
                </motion.span>
              ) : justSucceeded ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="flex items-center gap-2"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.4 }}
                    className="flex"
                  >
                    <Check className="h-4 w-4" />
                  </motion.span>
                  Analysé
                </motion.span>
              ) : status === "loading" ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <RgbLoader size={16} />
                  Analyse...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Analyser
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
        {credits === 0 ? (
          <p className="mt-2 text-xs text-pink-300">
            Solde de crédits épuisé.{" "}
            <Link href="/#pricing" className="font-medium underline-offset-4 hover:underline">
              Achetez un pack
            </Link>{" "}
            pour continuer à analyser des produits.
          </p>
        ) : (
          <p className="mt-2 text-xs text-white/40">
            Entrez des mots-clés ou collez l&apos;URL d&apos;une annonce
            AliExpress pour lancer l&apos;analyse complète (1 crédit par
            analyse réussie).
          </p>
        )}
      </form>

      <AnimatePresence mode="wait">
        {status === "error" && errorMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 rounded-2xl border border-pink-400/30 bg-pink-400/10 p-5 text-sm text-pink-200"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p>{errorMessage}</p>
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => runAnalysis(query.trim())}
                  className="mt-2 text-xs font-semibold uppercase tracking-wide text-pink-100 underline-offset-4 hover:underline"
                >
                  Réessayer
                </button>
              )}
            </div>
          </motion.div>
        )}

        {status === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/[0.03] backdrop-blur-sm"
          >
            {result.isExample && (
              <div className="flex items-center gap-1.5 border-b border-amber-400/20 bg-amber-400/10 px-5 py-2 text-xs font-medium text-amber-200">
                Exemple illustratif — aucun crédit utilisé, aucune donnée
                récupérée en direct.
              </div>
            )}
            <div className="flex items-center gap-4 border-b border-white/10 p-5">
              <ProductThumbnail
                src={result.product_image_url}
                alt={result.title}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {result.title}
                </p>
                {result.rating !== null && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                    <Star className="h-3 w-3 shrink-0 text-amber-300" />
                    {result.rating.toLocaleString("fr-FR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    /5
                    {result.reviewCount !== null
                      ? ` (${result.reviewCount} avis)`
                      : ""}
                  </p>
                )}
                <p className="mt-1 text-xs text-white/40">
                  Variante : {result.variant ?? "non précisée (prix de l'offre par défaut)"}
                  {" · "}Destination : France
                  {" · "}Analysé le {formatAnalyzedAt(result.analyzedAt)}
                </p>
              </div>
              {result.isComplete ? (
                <span className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-1 text-[11px] font-medium text-green-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Vérifié
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                  <AlertTriangle className="h-3 w-3" />
                  Partiellement vérifié
                </span>
              )}
            </div>

            {/* Liste de lignes label/valeur plutot qu'un tableau : reste
                lisible sans jamais avoir besoin de defiler horizontalement,
                du telephone (375px) au desktop. */}
            <div className="divide-y divide-white/10 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Sous-total
                </span>
                <span className="text-white/70">
                  {formatEuro(result.subtotal)} <StatusTag status="confirmed" />
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Variante
                </span>
                <span className="text-white/70">
                  {result.variant ?? "prix de l'offre par défaut"}{" "}
                  <StatusTag status={result.variantStatus} />
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Frais de port
                </span>
                <span className="text-white/70">
                  {formatEuro(result.shipping)} <StatusTag status={result.shippingStatus} />
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Taxes d&apos;importation
                </span>
                <span className="text-white/70">
                  {formatEuro(result.importFee)} <StatusTag status={result.importFeeStatus} />
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3 font-semibold">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  {result.isComplete ? "Coût total" : "Coût partiel estimé"}
                </span>
                <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                  <CountUp
                    value={result.isComplete ? (result.total as number) : result.partialTotal}
                    format={formatEuro}
                  />
                </span>
              </div>
              {!result.isComplete && (
                <div className="px-5 py-3">
                  <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-200">
                    Total hors frais inconnus —{" "}
                    {[
                      result.shippingStatus === "missing" &&
                        "la livraison n'est pas incluse (introuvable sur la fiche)",
                      result.importFeeStatus === "estimated" &&
                        "les taxes sont une estimation TVA, pas le montant réel du paiement",
                      result.variantStatus === "missing" &&
                        "le sous-total correspond à l'offre par défaut, pas à une variante identifiée",
                    ]
                      .filter(Boolean)
                      .join(" ; ")}
                    . Le coût réel payé peut être plus élevé.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-x-3 px-5 py-3">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Lien
                </span>
                <Link
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Voir
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {typeof result.creditsDebited === "boolean" && (
              <p className="border-t border-white/10 px-5 py-3 text-xs text-white/40">
                {result.creditsDebited ? (
                  result.isComplete ? (
                    "1 crédit débité — analyse complète (tous les frais confirmés)."
                  ) : (
                    <>
                      1 crédit débité — l&apos;annonce a été analysée avec
                      succès (produit et sous-total confirmés), même si le
                      coût ci-dessus reste{" "}
                      <strong className="text-amber-300/80">partiel</strong> :
                      l&apos;analyse elle-même a bien eu lieu et a un coût
                      réel côté fournisseur de données, que le résultat soit
                      complet ou non.
                    </>
                  )
                ) : (
                  "Aucun crédit débité pour cette analyse (incident technique passager) — votre solde n'a pas changé."
                )}
              </p>
            )}

            <EstimateBlock
              total={result.total}
              partialTotal={result.partialTotal}
              isComplete={result.isComplete}
              importFee={result.importFee}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
