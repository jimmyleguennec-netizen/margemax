"use client";

import dynamic from "next/dynamic";

/**
 * Le panneau d'authentification n'est rendu QUE cote client (ssr: false) :
 * plus aucun risque de mismatch d'hydratation SSR/client sur ce formulaire
 * (symptome signale : champs et boutons totalement inertes sur Safari
 * mobile en production). Contrepartie assumee : un squelette s'affiche le
 * temps que le JS se charge -- le formulaire visible est, par
 * construction, toujours deja interactif.
 */
const NeonAuthPanel = dynamic(
  () => import("@/components/auth/neon-auth-panel").then((m) => m.NeonAuthPanel),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[320px] w-full max-w-sm items-center justify-center text-sm text-white/70"
      >
        Chargement du formulaire…
      </div>
    ),
  }
);

export function NeonAuthPanelClient({ initialMode }: { initialMode: "login" | "signup" }) {
  return <NeonAuthPanel initialMode={initialMode} />;
}
