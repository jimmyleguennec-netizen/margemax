"use client";

import { useState } from "react";
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

const BANNER_TEXT = "🎁 3 analyses offertes à l'inscription";

function ScrollingBanner() {
  return (
    <div
      role="marquee"
      aria-label={BANNER_TEXT}
      className="relative mx-6 h-4 flex-1 overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-y-0 flex w-max items-center gap-16 whitespace-nowrap text-[11px] font-medium text-cyan-200/70"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>{BANNER_TEXT}</span>
        ))}
      </motion.div>
    </div>
  );
}

function TopBar({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="hidden w-full items-center justify-end border-b border-white/5 bg-black/60 px-4 py-1.5 sm:flex">
      <ScrollingBanner />

      <Link
        href={loggedIn ? "/dashboard" : "/signup"}
        className="shrink-0 origin-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200 shadow-[0_0_12px_-2px_rgba(34,211,238,0.6)] transition-all duration-300 hover:scale-x-105 hover:bg-cyan-400/20 hover:shadow-[0_0_18px_-2px_rgba(34,211,238,0.9)]"
      >
        {loggedIn ? "Mon espace" : "Essayer maintenant"}
      </Link>
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  loggedIn,
}: {
  open: boolean;
  onClose: () => void;
  loggedIn: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-xl sm:hidden"
        >
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" onClick={onClose}>
              <Logo className="h-12" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 text-cyan-300 transition-colors hover:bg-cyan-400/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="container flex flex-1 flex-col items-center justify-center gap-2">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block px-4 py-3 text-2xl font-semibold text-white/80 transition-colors hover:text-cyan-300"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="container mb-10 flex flex-col gap-3"
          >
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.8)]"
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white/80"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.8)]"
                >
                  Essayer gratuitement
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
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
          "w-full border-b backdrop-blur-xl transition-colors duration-300",
          scrolled
            ? "border-cyan-500/20 bg-slate-950/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            : "border-white/10 bg-black/40"
        )}
      >
        <div
          className={cn(
            "container flex items-center justify-between transition-[height] duration-300",
            scrolled ? "h-12" : "h-16"
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 text-cyan-300 transition-colors hover:bg-cyan-400/10 sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} loggedIn={loggedIn} />
    </motion.header>
  );
}
