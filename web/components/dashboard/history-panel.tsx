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

export function HistoryPanel({ entries }: { entries: HistoryEntry[] }) {
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="px-5 py-3 font-medium">Heure</th>
              <th className="px-5 py-3 font-medium">Recherche</th>
              <th className="px-5 py-3 font-medium">Coût total</th>
              <th className="px-5 py-3 font-medium">Lien</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-4 text-white/40">
                  {formatTime(entry.timestamp)}
                </td>
                <td className="px-5 py-4">
                  <p className="text-white">{entry.title}</p>
                  <p className="text-xs text-white/40">
                    Recherché : « {entry.query} »
                  </p>
                </td>
                <td className="px-5 py-4 font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                  {entry.total}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 transition-colors hover:text-cyan-200"
                  >
                    Voir
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-white/10 px-5 py-3 text-xs text-white/30">
        Historique de cette session — les recherches ne sont pas encore
        sauvegardées de façon permanente sur votre compte.
      </p>
    </div>
  );
}
