"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, History, LogOut, Search, Settings, Zap } from "lucide-react";

import { logout } from "@/lib/actions/auth";
import { AnimatedTabs, type AnimatedTabItem } from "@/components/ui/animated-tabs";
import { CreditCardInput } from "@/components/ui/credit-card-input";
import { InteractiveGrid } from "@/components/ui/interactive-grid";
import { Logo } from "@/components/ui/logo";
import { SearchPanel } from "@/components/dashboard/search-panel";
import { CalculatorPanel } from "@/components/dashboard/calculator-panel";
import { HistoryPanel, type HistoryEntry } from "@/components/dashboard/history-panel";

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
}: {
  email: string;
  isDemo: boolean;
  credits: number | null;
  creditsMax: number | null;
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
        <h3 className="mb-1 text-center text-sm font-medium uppercase tracking-wider text-cyan-200/70">
          Moyen de paiement
        </h3>
        <p className="mb-6 text-center text-xs text-white/40">
          Aperçu visuel de la carte -- l&apos;achat de crédits se fait
          aujourd&apos;hui via Stripe Checkout.
        </p>
        <CreditCardInput />
      </div>
    </div>
  );
}

export function DashboardShell({
  email,
  isDemo = false,
  credits = null,
  creditsMax = null,
}: {
  email: string;
  isDemo?: boolean;
  credits?: number | null;
  creditsMax?: number | null;
}) {
  const [active, setActive] = useState("recherche");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

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
            {credits !== null && (
              <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 shadow-[0_0_14px_-4px_rgba(34,211,238,0.6)]">
                <Zap className="h-3.5 w-3.5" />
                {credits}
                {creditsMax !== null ? ` / ${creditsMax}` : ""} crédits
              </span>
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
                  onResult={(entry) =>
                    setHistory((prev) => [entry, ...prev])
                  }
                />
              )}
              {active === "calculateur" && <CalculatorPanel />}
              {active === "historique" && <HistoryPanel entries={history} />}
              {active === "parametres" && (
                <ParametresPanel
                  email={email}
                  isDemo={isDemo}
                  credits={credits}
                  creditsMax={creditsMax}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </InteractiveGrid>
  );
}
