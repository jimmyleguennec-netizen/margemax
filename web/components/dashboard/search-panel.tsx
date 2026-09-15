"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Link2,
  Package,
  Search,
} from "lucide-react";

import { RgbLoader } from "@/components/ui/rgb-loader";

type Status = "idle" | "loading" | "result" | "error";

type ApiResult = {
  title: string;
  url: string;
  subtotal: number | null;
  shipping: number | null;
  importFee: number | null;
  total: number | null;
  currency: string;
};

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

export function SearchPanel({
  onResult,
}: {
  onResult?: (entry: {
    id: string;
    query: string;
    title: string;
    total: string;
    url: string;
    timestamp: number;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data?.error ?? "La recherche a échoué -- réessayez dans un instant."
        );
        setStatus("error");
        return;
      }

      const apiResult = data as ApiResult;
      setResult(apiResult);
      setStatus("result");

      onResult?.({
        id: `${Date.now()}`,
        query: trimmed,
        title: apiResult.title,
        total: formatEuro(apiResult.total),
        url: apiResult.url,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("[SearchPanel] Échec de l'appel /api/search :", err);
      setErrorMessage(
        "Impossible de contacter le service de recherche -- réessayez dans un instant."
      );
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
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
        <div className="relative mt-2 flex items-center gap-2">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
            <input
              id="search-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ex : aliexpress.com/item/1005006478208156.html"
              className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || !query.trim()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.8)] transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-[0_0_28px_-2px_rgba(34,211,238,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? <RgbLoader size={16} /> : <Search className="h-4 w-4" />}
            Analyser
          </button>
        </div>
        <p className="mt-2 text-xs text-white/30">
          Collez un lien produit direct pour un résultat exact -- la
          recherche par mots-clés n&apos;est pas encore prise en charge.
        </p>
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
            <p>{errorMessage}</p>
          </motion.div>
        )}

        {status === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/[0.03] backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 border-b border-white/10 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <Package className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {result.title}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-1 text-[11px] font-medium text-green-300">
                <CheckCircle2 className="h-3 w-3" />
                Vérifié
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                    <th className="px-5 py-3 font-medium">Sous-total</th>
                    <th className="px-5 py-3 font-medium">Frais de port</th>
                    <th className="px-5 py-3 font-medium">
                      Taxes d&apos;importation
                    </th>
                    <th className="px-5 py-3 font-medium">Coût total</th>
                    <th className="px-5 py-3 font-medium">Lien</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-4 text-white/70">
                      {formatEuro(result.subtotal)}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {formatEuro(result.shipping)}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {formatEuro(result.importFee)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                      {formatEuro(result.total)}
                    </td>
                    <td className="px-5 py-4">
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
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {(result.shipping === null || result.importFee === null) && (
              <p className="border-t border-white/10 px-5 py-3 text-xs text-white/30">
                Certains champs (livraison ou frais d&apos;importation) n&apos;ont
                pas pu être extraits de cette page -- ils sont affichés
                comme absents plutôt qu&apos;estimés au hasard.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
