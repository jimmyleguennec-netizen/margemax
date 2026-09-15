"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Calculator,
  History,
  LogOut,
  Search,
  Settings,
} from "lucide-react";

import { logout } from "@/lib/actions/auth";
import { AnimatedTabs, type AnimatedTabItem } from "@/components/ui/animated-tabs";
import { CreditCardInput } from "@/components/ui/credit-card-input";

const tabs: AnimatedTabItem[] = [
  { value: "recherche", label: "Recherche", icon: Search },
  { value: "calculateur", label: "Calculateur", icon: Calculator },
  { value: "historique", label: "Historique", icon: History },
  { value: "parametres", label: "Paramètres", icon: Settings },
];

function ComingSoonPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-sm">
      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-300">
        Bientôt disponible
      </span>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="max-w-md text-sm text-white/50">{description}</p>
    </div>
  );
}

function ParametresPanel({ email, isDemo }: { email: string; isDemo: boolean }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-sm">
        <div>
          <p className="text-sm text-white/40">
            {isDemo ? "Aperçu de démonstration" : "Connecté en tant que"}
          </p>
          <p className="text-lg font-medium text-white">{email}</p>
        </div>
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
}: {
  email: string;
  isDemo?: boolean;
}) {
  const [active, setActive] = useState("recherche");

  return (
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
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          >
            Marge<span className="text-cyan-400">Max</span>
          </Link>
          <AnimatedTabs
            tabs={tabs}
            value={active}
            onValueChange={setActive}
            layoutId="dashboard-tab-indicator"
            className="hidden sm:inline-flex"
          />
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

      {isDemo && (
        <div className="border-b border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-2.5 text-center text-xs text-yellow-200">
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Mode démonstration -- la connexion à Supabase est momentanément
            indisponible, ceci est un aperçu statique de l&apos;interface.
          </span>
        </div>
      )}

      <main className="container py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {active === "recherche" && (
              <ComingSoonPanel
                title="Recherche de produits"
                description="La recherche AliExpress (par lien direct ou par mot-clé) arrive prochainement sur la nouvelle interface."
              />
            )}
            {active === "calculateur" && (
              <ComingSoonPanel
                title="Calculateur de marge"
                description="Calculez votre marge nette et votre ROI à partir de vos propres coûts d'achat, de livraison et de vente."
              />
            )}
            {active === "historique" && (
              <ComingSoonPanel
                title="Historique & carnet de sourcing"
                description="Retrouvez ici vos recherches précédentes, vos favoris et votre comparateur de fournisseurs."
              />
            )}
            {active === "parametres" && (
              <ParametresPanel email={email} isDemo={isDemo} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
