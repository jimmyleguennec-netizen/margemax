"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";

const links = [
  { href: "#demo", label: "Démo" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

// Aucun compte reseau social officiel n'existe encore pour MargeMax --
// pas de lien vide vers "#", on retire les icones tant qu'aucune URL
// reelle n'est disponible (Instagram/Facebook/X).

// "crédits" partout (pas "analyses") : coherent avec le vocabulaire reel
// du produit (solde de credits affiche au dashboard, 1 credit = 1 analyse).
const BANNER_TEXT = "🎁 3 crédits offerts à l'inscription";

function Banner() {
  return (
    <p className="mx-6 flex-1 truncate text-center text-[11px] font-medium text-cyan-200/70">
      {BANNER_TEXT}
    </p>
  );
}

function TopBar({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="hidden w-full items-center justify-end border-b border-white/5 bg-black/60 px-4 py-1.5 sm:flex">
      <Banner />

      <Link
        href={loggedIn ? "/dashboard" : "/signup"}
        className="shrink-0 origin-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200 shadow-[0_0_12px_-2px_rgba(34,211,238,0.6)] transition-all duration-300 hover:scale-x-105 hover:bg-cyan-400/20 hover:shadow-[0_0_18px_-2px_rgba(34,211,238,0.9)]"
      >
        {loggedIn ? "Mon espace" : "Essayer maintenant"}
      </Link>
    </div>
  );
}

const drawerAnchors = [
  { href: "#demo", label: "DÉMO" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

const drawerList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const drawerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } },
};

function MobileMenu({
  open,
  onClose,
  loggedIn,
}: {
  open: boolean;
  onClose: () => void;
  loggedIn: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#05050a]/70 backdrop-blur-md"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col border-l border-white/10 bg-[#0a0a14]/95 px-6 pb-8 pt-4 shadow-[-20px_0_60px_-20px_rgba(34,211,238,0.35)]"
          >
            <div className="flex h-12 items-center justify-between">
              <Link href="/" onClick={onClose}>
                <Logo className="h-10" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/5"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <motion.nav
              variants={drawerList}
              initial="hidden"
              animate="show"
              className="mt-6 flex flex-col gap-1"
            >
              {loggedIn ? (
                <motion.div variants={drawerItem}>
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="block rounded-lg bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-[#05050a]"
                  >
                    Mon espace
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div variants={drawerItem}>
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="block rounded-lg border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
                    >
                      Se connecter
                    </Link>
                  </motion.div>
                  <motion.div variants={drawerItem}>
                    <Link
                      href="/signup"
                      onClick={onClose}
                      className="mt-2 block rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-3 text-center text-sm font-semibold text-[#05050a]"
                    >
                      Créer un compte
                    </Link>
                  </motion.div>
                </>
              )}

              <motion.div variants={drawerItem} className="my-4 h-px bg-white/10" />

              {drawerAnchors.map((link) => (
                <motion.div key={link.href} variants={drawerItem}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block rounded-lg px-4 py-3 text-base font-medium tracking-wide text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user } = useSupabaseUser();
  const loggedIn = Boolean(user);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  // Bloque le scroll de la page derriere le menu plein ecran tant qu'il
  // est ouvert -- sans ca, un swipe sur l'overlay peut faire defiler la
  // page en dessous (visible au relachement, ou via le repli/deploiement
  // de la barre d'adresse mobile pendant le scroll), ce qui rend
  // l'ouverture/fermeture du menu moins fluide sur telephone. Restaure
  // systematiquement au demontage, jamais de scroll bloque en permanence
  // si le composant disparait pendant que le menu est ouvert.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full"
    >
      <AnimatePresence initial={false}>
        {!scrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <TopBar loggedIn={loggedIn} />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          // Flou (backdrop-blur) : desktop en permanence ; sur mobile uniquement
          // une fois la page defilee (fond deja opaque a 90 %, ce qui limite le
          // cout du filtre pendant le scroll).
          "w-full border-b transition-all duration-300 sm:backdrop-blur-xl",
          scrolled
            ? "border-cyan-500/20 bg-slate-950/90 shadow-[0_8px_30px_-10px_rgba(34,211,238,0.25)] backdrop-blur-md sm:bg-slate-950/70"
            : "border-white/10 bg-black/80 sm:bg-black/40"
        )}
      >
        <div
          className={cn(
            "container flex origin-top items-center justify-between transition-all duration-300",
            scrolled ? "h-12 scale-[0.985]" : "h-16"
          )}
        >
          <Link href="/">
            <Logo
              className={cn(
                "transition-all duration-300",
                scrolled ? "h-9 md:h-10" : "h-12 md:h-14"
              )}
            />
          </Link>

          <nav
            onMouseLeave={() => setHovered(null)}
            className="hidden items-center gap-1 sm:flex"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                className="relative px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                {hovered === link.href && (
                  <motion.span
                    layoutId="active-indicator"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="origin-center rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.8)] transition-all duration-300 hover:scale-x-105 hover:bg-[position:100%_0] hover:shadow-[0_0_24px_-2px_rgba(34,211,238,0.8)]"
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="origin-center rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-all duration-300 hover:scale-x-105 hover:text-white"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="origin-center rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.8)] transition-all duration-300 hover:scale-x-105 hover:bg-[position:100%_0] hover:shadow-[0_0_24px_-2px_rgba(34,211,238,0.8)]"
                >
                  Essayer gratuitement
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            // z-index/pointer-events explicites : sur mobile, ce bouton
            // doit toujours rester au-dessus de tout calque decoratif
            // (fond de grille interactif, halos flous...) qui pourrait
            // se retrouver au-dessus de lui selon l'ordre de peinture du
            // navigateur.
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 text-cyan-300 pointer-events-auto transition-colors hover:bg-cyan-400/10 sm:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} loggedIn={loggedIn} />
    </motion.header>
  );
}
