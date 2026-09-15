"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Package,
  Search,
} from "lucide-react";

import { RgbLoader } from "@/components/ui/rgb-loader";

type Status = "idle" | "loading" | "result";

// Exemple illustratif -- aucun backend de recherche AliExpress n'est
// encore branche cote Next.js (ScraperAPI / AliExpress Open Platform),
// contrairement a l'app Streamlit existante. Cette maquette montre la
// structure exacte du futur resultat reel.
const DEMO_RESULT = {
  title: "Chargeur sans fil 3-en-1",
  variant: "Noir",
  url: "https://www.aliexpress.com",
  subtotal: "7,89 €",
  shipping: "1,99 €",
  importTax: "3,60 €",
  total: "13,48 €",
};

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || status === "loading") return;
    setStatus("loading");
    window.setTimeout(() => setStatus("result"), 1100);
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
              placeholder="ex : montre connectée -- ou -- aliexpress.com/item/..."
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
          Collez un lien produit direct pour un résultat exact, ou tapez des
          mots-clés pour comparer plusieurs offres.
        </p>
      </form>

      <AnimatePresence mode="wait">
        {status === "result" && (
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
                  {DEMO_RESULT.title}
                </p>
                <p className="text-xs text-white/40">
                  Variante : {DEMO_RESULT.variant}
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
                      {DEMO_RESULT.subtotal}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {DEMO_RESULT.shipping}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {DEMO_RESULT.importTax}
                    </td>
                    <td className="px-5 py-4 font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                      {DEMO_RESULT.total}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={DEMO_RESULT.url}
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

            <p className="border-t border-white/10 px-5 py-3 text-xs text-white/30">
              Exemple illustratif -- la recherche réelle (ScraperAPI /
              AliExpress) n&apos;est pas encore branchée sur cette nouvelle
              interface.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
