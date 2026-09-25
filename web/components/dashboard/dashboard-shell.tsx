"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calculator,
  CreditCard,
  History,
  LogOut,
  Plus,
  Receipt,
  Search,
  User,
  Zap,
} from "lucide-react";

import { logout } from "@/lib/actions/auth";
import { AnimatedTabs, type AnimatedTabItem } from "@/components/ui/animated-tabs";
import { InteractiveGrid } from "@/components/ui/interactive-grid";
import { Logo } from "@/components/ui/logo";
import { RgbLoader } from "@/components/ui/rgb-loader";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SessionWatcher } from "@/components/dashboard/session-watcher";
import { PurchaseSuccessModal } from "@/components/dashboard/purchase-success-modal";
import {
  clearPendingPurchase,
  markCelebrated,
  readPendingPurchase,
  wasCelebrated,
} from "@/lib/pending-purchase";
import {
  SearchPanel,
  historyEntryToResult,
  type ApiResult,
} from "@/components/dashboard/search-panel";
import { CalculatorPanel } from "@/components/dashboard/calculator-panel";
import { HistoryPanel, type HistoryEntry } from "@/components/dashboard/history-panel";
import { BuyCreditsModal } from "@/components/dashboard/buy-credits-modal";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { HelpModal } from "@/components/dashboard/help-modal";
import { ContactModal } from "@/components/dashboard/contact-modal";
import { formatEuro, PACKS, type Pack } from "@/lib/packs";
import {
  CheckoutConsentDialog,
  type ConsentPack,
} from "@/components/purchase/checkout-consent-dialog";

const TAB_VALUES = ["recherche", "calculateur", "historique", "account"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

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
  { value: "account", label: "Mon compte", icon: User },
];

// Bandeau d'aide contextuel du header, change selon l'onglet actif -- voir
// ActiveTabHint ci-dessous. Vouvoiement, comme partout ailleurs sur le
// site -- une session precedente avait delibere-ment garde ce bandeau en
// tutoiement (choix de ton assume, documente dans une version anterieure
// de ce commentaire), mais l'audit du 2026-09-18 demande explicitement
// une seule forme d'adresse sur tout le site, sans melange : uniformise
// ici en vouvoiement (voir passation.md).
const TAB_HELP: Record<string, { title: string; body: string }> = {
  recherche: {
    title: "Recherche & Sourcing",
    body: "Entre un mot-clé ou un lien AliExpress pour analyser les coûts réels (1 crédit par analyse réussie).",
  },
  calculateur: {
    title: "Calculateur de Marge",
    body: "Simule tes coûts et marges en temps réel. Utilisable à volonté sans consommer de crédit.",
  },
  historique: {
    title: "Historique des analyses",
    body: "Retrouve et réexamine les produits analysés lors de cette session.",
  },
  account: {
    title: "Mon compte",
    body: "Gère ton compte, consulte ton solde et recharge tes crédits d'analyse.",
  },
};

function ActiveTabHint({ active }: { active: string }) {
  const hint = TAB_HELP[active];
  if (!hint) return null;

  return (
    <div className="border-t border-white/5 bg-white/[0.02]">
      <div className="container py-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-white/70"
          >
            <strong className="font-semibold text-cyan-200">{hint.title}</strong>
            {" — "}
            {hint.body}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Bouton "Gérer mes factures" -- ouvre le vrai portail de facturation
 * Stripe (POST /api/stripe/billing-portal). Aucun bouton affiche en mode
 * demo (pas de compte reel, donc jamais de client Stripe possible).
 * L'erreur la plus frequente attendue -- aucun achat encore effectue,
 * donc pas de stripe_customer_id -- est affichee telle quelle plutot
 * qu'un message generique, voir la route pour le detail.
 */
function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/billing-portal", { method: "POST" });
      const data: { url?: string; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok || !data.url) {
        setError(data.error ?? "Impossible d'ouvrir le portail de facturation pour le moment.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("[BillingPortalButton] Échec de l'appel /api/stripe/billing-portal :", err);
      setError("Impossible de contacter le serveur pour le moment. Réessaie.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-full border border-cyan-400/30 px-5 py-2.5 text-sm font-medium text-cyan-200 transition-all hover:border-cyan-400/60 hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <RgbLoader size={16} /> : <Receipt aria-hidden="true" className="h-4 w-4" />}
        {loading ? "Ouverture..." : "Gérer mes factures"}
      </button>
      {error && <p className="mt-2 text-xs text-pink-300">{error}</p>}
    </div>
  );
}

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
  const creditsPurchasedTotal = purchases.reduce((sum, p) => sum + p.credits, 0);
  const amountSpentTotal = purchases.reduce((sum, p) => sum + p.amount_total, 0) / 100;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-sm glow-hover-sm">
        <div>
          <p className="text-sm text-white/60">
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
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Se déconnecter
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm glow-hover-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="text-sm font-medium uppercase tracking-wider text-cyan-200/70">
            Crédits
          </h3>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
            <Zap aria-hidden="true" className="h-5 w-5" />
            {credits === null ? "--" : <AnimatedCounter value={credits} />}
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

        {/* Recapitulatif -- uniquement des chiffres directement derives
            des achats reels (jamais un "credits utilises" qui supposerait
            connaitre le nombre de credits offerts a l'inscription comme
            une constante fixe non trackee cote code : ce serait fragile
            si ce nombre change ou si un solde est ajuste manuellement). */}
        {purchases.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center">
            <div>
              <p className="text-lg font-bold text-white"><AnimatedCounter value={creditsPurchasedTotal} /></p>
              <p className="text-[11px] text-white/60">Crédits achetés</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white"><AnimatedCounter value={purchases.length} /></p>
              <p className="text-[11px] text-white/60">
                Achat{purchases.length > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{formatEuro(amountSpentTotal)}</p>
              <p className="text-[11px] text-white/60">Dépensé au total</p>
            </div>
          </div>
        )}
      </div>

      {!isDemo && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <h3 className="text-sm font-medium uppercase tracking-wider text-cyan-200/70">
              Moyen de paiement &amp; factures
            </h3>
            <p className="max-w-sm text-xs text-white/60">
              Consulte tes factures et gère le moyen de paiement utilisé
              pour tes achats de crédits, via le portail sécurisé de Stripe.
            </p>
            <BillingPortalButton />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
        <h3 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-cyan-200/70">
          Achats
        </h3>
        {purchases.length === 0 ? (
          <p className="text-center text-sm text-white/60">
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
                  <CreditCard aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
                  Pack {purchase.pack_key} · {purchase.credits} crédits
                </span>
                <span className="text-right text-white/60">
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
  const searchParams = useSearchParams();
  const router = useRouter();
  // Onglet actif reflete dans l'URL (?tab=account, etc.) : un lien direct
  // vers /dashboard?tab=account (menu du compte, retour du portail de
  // facturation Stripe...) doit ouvrir le bon onglet des le chargement,
  // et pas systematiquement "Recherche".
  const [active, setActiveState] = useState<TabValue>(() => {
    const fromUrl = searchParams.get("tab");
    return isTabValue(fromUrl) ? fromUrl : "recherche";
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [reopened, setReopened] = useState<ApiResult | null>(null);
  // false tant qu'on n'a pas confirmé que l'historique lu vient vraiment
  // de Supabase (migration_search_history_details.sql exécutée) -- pilote
  // l'avertissement "non sauvegardé" dans HistoryPanel. Chargé une seule
  // fois au montage ; les analyses de CETTE session continuent d'être
  // ajoutées localement en temps réel (voir onResult plus bas), qu'elles
  // soient persistées ou non côté serveur.
  const [historyPersisted, setHistoryPersisted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { entries?: HistoryEntry[]; migrationApplied?: boolean } | null) => {
        if (cancelled || !data) return;
        setHistoryPersisted(Boolean(data.migrationApplied));
        if (data.entries?.length) {
          setHistory((prev) => {
            const knownIds = new Set(prev.map((e) => e.id));
            const fromServer = data.entries!.filter((e) => !knownIds.has(e.id));
            return [...prev, ...fromServer].sort((a, b) => b.timestamp - a.timestamp);
          });
        }
      })
      .catch((err) => {
        console.warn("[dashboard] échec du chargement de l'historique persisté :", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  // Solde de credits affiche : initialise depuis la valeur lue au chargement
  // de la page, puis mis a jour en direct par SearchPanel apres chaque
  // debit reussi (voir app/api/analyze), sans recharger toute la page.
  const [liveCredits, setLiveCredits] = useState(credits);

  // --- Retour de paiement : le solde suit le serveur apres router.refresh(),
  // et la celebration ne se declenche QUE si une vraie ligne credit_purchases
  // (creee par le webhook Stripe) correspond a l'achat demarre depuis ce
  // navigateur (ou au retour ?purchase=success) -- jamais sur une supposition.
  useEffect(() => {
    setLiveCredits(credits);
  }, [credits]);

  const purchasesRef = useRef(purchases);
  purchasesRef.current = purchases;
  const fromCheckoutParam = searchParams.get("purchase") === "success";
  const [celebration, setCelebration] = useState<{ credits: number; packLabel?: string } | null>(
    null
  );

  useEffect(() => {
    const latest = purchases[0];
    if (!latest || wasCelebrated(latest.id)) return;
    const pending = readPendingPurchase();
    const createdAt = new Date(latest.created_at).getTime();
    const matchesPending = pending !== null && createdAt >= pending.ts - 120_000;
    const matchesParam = fromCheckoutParam && Date.now() - createdAt < 60 * 60 * 1000;
    if (!matchesPending && !matchesParam) return;

    markCelebrated(latest.id);
    clearPendingPurchase();
    setCelebration({
      credits: latest.credits,
      packLabel: PACKS.find((p) => p.key === latest.pack_key)?.label,
    });
    if (fromCheckoutParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete("purchase");
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    }
  }, [purchases, fromCheckoutParam]);

  // Le webhook peut arriver quelques secondes apres le retour de Stripe :
  // tant qu'un achat est attendu, on relit le serveur (8 x 4 s max).
  useEffect(() => {
    if (!readPendingPurchase() && !fromCheckoutParam) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      const latest = purchasesRef.current[0];
      if ((latest && wasCelebrated(latest.id)) || tries > 8) {
        window.clearInterval(id);
        return;
      }
      router.refresh();
    }, 4000);
    return () => window.clearInterval(id);
  }, [fromCheckoutParam, router]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);


  function setActive(tab: TabValue) {
    setActiveState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

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
    // Nettoie ?pack= de l'URL (pour qu'un rechargement de page ne rouvre
    // pas la modale indefiniment) sans perdre ?tab= -- annuler un achat
    // ne doit pas renvoyer l'utilisateur a l'onglet Recherche s'il etait
    // ailleurs.
    router.replace(`/dashboard?tab=${active}`);
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
      <div className="relative min-h-[100dvh] overflow-x-clip bg-[#05050a]">
        <SessionWatcher />
        <div
          aria-hidden
          className="pointer-events-none fixed -left-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -right-40 top-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[140px]"
        />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between gap-2">
            {/* Logo retreci sous sm (640px) : a sa taille par defaut
                (h-14), combine au badge de credits, il depassait la
                largeur d'un ecran de telephone (375-414px) et forcait un
                defilement horizontal du header. */}
            <Link href="/" className="shrink-0">
              <Logo className="h-9 sm:h-14 md:h-16" />
            </Link>
            <AnimatedTabs
              tabs={tabs}
              value={active}
              onValueChange={(value) => isTabValue(value) && setActive(value)}
              layoutId="dashboard-tab-indicator"
              className="hidden sm:inline-flex"
            />
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              {liveCredits !== null && (
                <>
                  <span className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-200 shadow-[0_0_14px_-4px_rgba(34,211,238,0.6)] sm:gap-1.5 sm:px-3 sm:py-1.5">
                    <Zap aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    <AnimatedCounter value={liveCredits} fromZero={false} />
                    {creditsMax !== null ? ` / ${creditsMax}` : ""}
                    <span className="hidden sm:inline">&nbsp;crédits</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setBuyModalOpen(true)}
                    aria-label="Acheter des crédits"
                    title="Acheter des crédits"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_14px_-4px_rgba(217,70,239,0.8)] transition-transform hover:scale-110"
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  </button>
                </>
              )}
              <AccountMenu
                isDemo={isDemo}
                onGoToAccount={() => setActive("account")}
                onOpenHelp={() => setHelpOpen(true)}
                onOpenContact={() => setContactOpen(true)}
              />
            </div>
          </div>

          {/* Onglets en dessous du header sur mobile, scrollables horizontalement */}
          <div className="container overflow-x-auto pb-3 sm:hidden">
            <AnimatedTabs
              tabs={tabs}
              value={active}
              onValueChange={(value) => isTabValue(value) && setActive(value)}
              layoutId="dashboard-tab-indicator-mobile"
            />
          </div>

          <ActiveTabHint active={active} />
        </header>

        <main className="relative z-10 container overflow-x-clip py-10 pointer-events-auto">
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
                  reopen={reopened}
                  onReopenConsumed={() => setReopened(null)}
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
                  persisted={historyPersisted}
                  onReopen={(entry) => {
                    const result = historyEntryToResult(entry);
                    if (!result) return;
                    setReopened(result);
                    setActive("recherche");
                  }}
                />
              )}
              {active === "account" && (
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

      <PurchaseSuccessModal
        credits={celebration?.credits ?? null}
        packLabel={celebration?.packLabel}
        onClose={() => setCelebration(null)}
      />

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

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        defaultEmail={isDemo ? undefined : email}
      />
    </InteractiveGrid>
  );
}
