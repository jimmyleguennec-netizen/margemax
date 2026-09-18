"use client";

import Link from "next/link";
import { ExternalLink, History as HistoryIcon } from "lucide-react";

export type HistoryEntry = {
  id: string;
  query: string;
  title: string;
  total: string;
  url: string;
  timestamp: number;
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryPanel({
  entries,
  onGoToSearch,
}: {
  entries: HistoryEntry[];
  onGoToSearch?: () => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-sm">
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
    );
  }

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
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
              <span className="font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                {entry.total}
              </span>
              <Link
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Voir
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <p className="border-t border-white/10 px-5 py-3 text-xs text-white/30">
        Historique de cette session — les recherches ne sont pas encore
        sauvegardées de façon permanente sur votre compte.
      </p>
    </div>
  );
}
