"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calculator,
  CreditCard,
  History,
  LogOut,
  Plus,
  Search,
  Settings,
  Zap,
} from "lucide-react";

import { logout } from "@/lib/actions/auth";
import { AnimatedTabs, type AnimatedTabItem } from "@/components/ui/animated-tabs";
import { InteractiveGrid } from "@/components/ui/interactive-grid";
import { Logo } from "@/components/ui/logo";
import { SearchPanel } from "@/components/dashboard/search-panel";
import { CalculatorPanel } from "@/components/dashboard/calculator-panel";
import { HistoryPanel, type HistoryEntry } from "@/components/dashboard/history-panel";
import { FirstLaunchHint } from "@/components/dashboard/first-launch-hint";
import { BuyCreditsModal } from "@/components/dashboard/buy-credits-modal";
import { formatEuro, PACKS, type Pack } from "@/lib/packs";
import {
  CheckoutConsentDialog,
  type ConsentPack,
} from "@/components/purchase/checkout-consent-dialog";

export type PurchaseEntry = {
  id: number;
  pack_key: string;
  credits: number;
  amount_total: number;
  currency: string;
  created_at: string;
};

const tabs: AnimatedTabItem[] = [
  { value: "recherche", label: "Recherche", icon: Search },
  { value: "calculateur", label: "Calculateur", icon: Calculator },
  { value: "historique", label: "Historique", icon: History },
  { value: "parametres", label: "Paramètres", icon: Settings },
];

function ParametresPanel({
  email,
  isDemo,
  credits,
  creditsMax,
  purchases,
  onOpenBuyModal,
}: {
  email: string;
  isDemo: boolean;
  credits: number | null;
  creditsMax: number | null;
  purchases: PurchaseEntry[];
  onOpenBuyModal: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-sm">
        <div>
          <p className="text-sm text-white/40">
            {isDemo ? "Aperçu de démonstration" : "Connecté en tant que"}
          </p>
          <p className="text-lg font-medium text-white">{email}</p>
        </div>
        {credits !== null && (
          <p className="flex items-center gap-1.5 text-sm text-cyan-300">
            <Zap className="h-4 w-4" />
            {credits} crédit{credits > 1 ? "s" : ""}
            {creditsMax !== null ? ` sur ${creditsMax}` : ""} disponible
            {credits > 1 ? "s" : ""}
          </p>
        )}
        {isDemo ? (
          <a
            href="/login"
            className="flex items-center gap-2 rounded-full border border-cyan-400/30 px-5 py-2.5 text-sm font-medium text-cyan-200 transition-all hover:border-cyan-400/60 hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.6)]"
          >
            Réessayer la connexion
          </a>
        ) : (
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-pink-400/40 hover:text-white hover:shadow-[0_0_18px_-4px_rgba(244,114,182,0.5)]"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="text-sm font-medium uppercase tracking-wider text-cyan-200/70">
            Crédits
          </h3>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
            <Zap className="h-5 w-5" />
            {credits ?? "--"}
            {creditsMax !== null ? ` / ${creditsMax}` : ""}
          </p>
          <button
            type="button"
            onClick={onOpenBuyModal}
            className="rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.8)] transition-all hover:scale-105"
          >
            Acheter des crédits
          </button>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <h3 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-cyan-200/70">
            Achats
          </h3>
          {purchases.length === 0 ? (
            <p className="text-center text-sm text-white/40">
              Aucun achat pour le moment.
            </p>
          ) : (
            <ul className="space-y-2">
              {purchases.map((purchase) => (
                <li
                  key={purchase.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2 text-white/70">
                    <CreditCard className="h-3.5 w-3.5 text-cyan-300" />
                    Pack {purchase.pack_key} · {purchase.credits} crédits
                  </span>
                  <span className="text-right text-white/40">
                    <span className="block font-medium text-white">
                      {formatEuro(purchase.amount_total / 100)}
                    </span>
                    <span className="block text-xs">
                      {new Date(purchase.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  userId,
  email,
  isDemo = false,
  credits = null,
  creditsMax = null,
  purchases = [],
  pendingPackKey = null,
}: {
  userId?: string;
  email: string;
  isDemo?: boolean;
  credits?: number | null;
  creditsMax?: number | null;
  purchases?: PurchaseEntry[];
  /** Pack en attente (?pack=<cle>) apres redirection depuis /login ou
   * /signup pour un utilisateur deja connecte -- voir app/dashboard/page.tsx
   * et app/(auth)/login|signup/page.tsx. */
  pendingPackKey?: string | null;
}) {
  const [active, setActive] = useState("recherche");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // Solde de credits affiche : initialise depuis la valeur lue au chargement
  // de la page, puis mis a jour en direct par SearchPanel apres chaque
  // debit reussi (voir app/api/analyze), sans recharger toute la page.
  const [liveCredits, setLiveCredits] = useState(credits);

  const router = useRouter();
  const pendingPack = PACKS.find((p) => p.key === pendingPackKey);
  const [consentPack, setConsentPack] = useState<ConsentPack | null>(
    pendingPack
      ? {
          key: pendingPack.key,
          label: pendingPack.label,
          credits: pendingPack.credits,
          priceEuros: pendingPack.priceEuros,
        }
      : null
  );

  function handleConsentCancel() {
    setConsentPack(null);
    // Nettoie ?pack= de l'URL pour qu'un rechargement de page ne rouvre
    // pas la modale indefiniment.
    router.replace("/dashboard");
  }

  // Achat de credits DANS le dashboard (bouton "+" du header ou "Acheter
  // des credits" dans Parametres) : ouvre BuyCreditsModal pour choisir un
  // pack, qui enchaine directement sur CheckoutConsentDialog deja gere
  // ci-dessus -- jamais de redirection vers "/" qui ferait quitter
  // l'espace connecte.
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  function handleChoosePackFromModal(pack: Pack) {
    setBuyModalOpen(false);
    setConsentPack({
      key: pack.key,
      label: pack.label,
      credits: pack.credits,
      priceEuros: pack.priceEuros,
    });
  }

  return (
    <InteractiveGrid>
      <div className="relative min-h-screen overflow-hidden bg-[#05050a]">
        <div
          aria-hidden
          className="pointer-events-none fixed -left-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -right-40 top-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[140px]"
        />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/">
              <Logo />
            </Link>
            <AnimatedTabs
              tabs={tabs}
              value={active}
              onValueChange={setActive}
              layoutId="dashboard-tab-indicator"
              className="hidden sm:inline-flex"
            />
            {liveCredits !== null && (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 shadow-[0_0_14px_-4px_rgba(34,211,238,0.6)]">
                  <Zap className="h-3.5 w-3.5" />
                  {liveCredits}
                  {creditsMax !== null ? ` / ${creditsMax}` : ""} crédits
                </span>
                <button
                  type="button"
                  onClick={() => setBuyModalOpen(true)}
                  aria-label="Acheter des crédits"
                  title="Acheter des crédits"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_14px_-4px_rgba(217,70,239,0.8)] transition-transform hover:scale-110"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Onglets en dessous du header sur mobile, scrollables horizontalement */}
          <div className="container overflow-x-auto pb-3 sm:hidden">
            <AnimatedTabs
              tabs={tabs}
              value={active}
              onValueChange={setActive}
              layoutId="dashboard-tab-indicator-mobile"
            />
          </div>
        </header>

        <main className="relative z-10 container py-10 pointer-events-auto">
          {!isDemo && <FirstLaunchHint />}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {active === "recherche" && (
                <SearchPanel
                  credits={liveCredits}
                  onCreditsChange={setLiveCredits}
                  onResult={(entry) =>
                    setHistory((prev) => [entry, ...prev])
                  }
                />
              )}
              {active === "calculateur" && <CalculatorPanel />}
              {active === "historique" && (
                <HistoryPanel
                  entries={history}
                  onGoToSearch={() => setActive("recherche")}
                />
              )}
              {active === "parametres" && (
                <ParametresPanel
                  email={email}
                  isDemo={isDemo}
                  credits={liveCredits}
                  creditsMax={creditsMax}
                  purchases={purchases}
                  onOpenBuyModal={() => setBuyModalOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BuyCreditsModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        onChoosePack={handleChoosePackFromModal}
      />

      <CheckoutConsentDialog
        pack={consentPack}
        userId={userId}
        onCancel={handleConsentCancel}
      />
    </InteractiveGrid>
  );
}
