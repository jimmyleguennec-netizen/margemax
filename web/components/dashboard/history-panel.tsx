"use client";

import Link from "next/link";
import { AlertTriangle, ExternalLink, History as HistoryIcon } from "lucide-react";

// Doit correspondre a HISTORY_LIMIT dans app/api/history/route.ts (nombre
// d'entrees reellement renvoyees par l'API) -- ici uniquement pour le
// texte affiche, pas une limite appliquee cote client.
const HISTORY_DISPLAY_LIMIT = 50;

export type HistoryEntry = {
  id: string;
  query: string;
  title: string;
  url: string;
  timestamp: number;
  /** cout REEL, null quand l'analyse etait incomplete (voir
   * lib/aliexpress-search.ts, AliExpressSearchResult.total). */
  total: number | null;
  /** toujours calculable, a afficher quand total est null. */
  partialTotal: number;
  isComplete: boolean;
  currency?: string;
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEuro(n: number): string {
  return (
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}

function EntryTotal({ entry }: { entry: HistoryEntry }) {
  if (entry.isComplete && entry.total !== null) {
    return (
      <span className="font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
        {formatEuro(entry.total)}
      </span>
    );
  }
  return (
    <span className="flex flex-col items-end">
      <span className="font-semibold text-amber-300">
        ≈ {formatEuro(entry.partialTotal)}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-amber-300/70">
        partiel
      </span>
    </span>
  );
}

/** Bandeau explicite sur la persistance -- affiché AVANT toute analyse
 * (donc aussi dans l'état vide) pour que l'utilisateur sache à quoi
 * s'attendre avant de compter dessus, pas seulement après coup. */
function PersistenceNotice({ persisted }: { persisted: boolean }) {
  if (persisted) return null;
  return (
    <div className="flex items-start gap-2 border-b border-amber-400/20 bg-amber-400/[0.06] px-5 py-3 text-xs text-amber-200">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Historique non sauvegardé de façon permanente pour le moment — les
        recherches de cette session disparaîtront au rechargement de la
        page ou à la reconnexion.
      </span>
    </div>
  );
}

export function HistoryPanel({
  entries,
  onGoToSearch,
  persisted = false,
}: {
  entries: HistoryEntry[];
  onGoToSearch?: () => void;
  /** true quand l'historique est réellement lu depuis le compte (Supabase)
   * -- false tant que la migration n'a pas été exécutée ou que la lecture
   * a échoué, auquel cas seules les entrées de cette session s'affichent. */
  persisted?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
        <PersistenceNotice persisted={persisted} />
        <div className="flex flex-col items-center gap-3 p-12 text-center">
          <HistoryIcon className="h-6 w-6 text-cyan-400/60" />
          <h2 className="text-lg font-semibold text-white">
            Aucune recherche pour l&apos;instant
          </h2>
          <p className="max-w-sm text-sm text-white/50">
            Lancez une analyse depuis l&apos;onglet Recherche — elle
            apparaîtra ici automatiquement.
          </p>
          {onGoToSearch && (
            <button
              type="button"
              onClick={onGoToSearch}
              className="mt-2 rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.8)] transition-all hover:scale-105"
            >
              Analyser mon premier produit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
      <PersistenceNotice persisted={persisted} />
      {/* Cartes empilees plutot qu'un tableau : lisibles sans defilement
          horizontal, du telephone (375px) au desktop. */}
      <div className="divide-y divide-white/5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-white">{entry.title}</p>
              <p className="text-xs text-white/40">
                Recherché : « {entry.query} » · {formatTime(entry.timestamp)}
              </p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <EntryTotal entry={entry} />
              {entry.url && (
                <Link
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Voir
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      {persisted && (
        <p className="border-t border-white/10 px-5 py-3 text-xs text-white/30">
          Historique lié à votre compte — conservé après reconnexion (les{" "}
          {HISTORY_DISPLAY_LIMIT} analyses les plus récentes).
        </p>
      )}
    </div>
  );
}
