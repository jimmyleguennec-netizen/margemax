"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter } from "lucide-react";

import { Logo } from "@/components/ui/logo";

const links = [
  { href: "#demo", label: "Démo" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

const socials = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

const BANNER_TEXT = "🎁 3 analyses offertes à l'inscription";

function ScrollingBanner() {
  return (
    <div className="relative mx-6 h-4 flex-1 overflow-hidden">
      <motion.div
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

function TopBar() {
  return (
    <div className="hidden w-full items-center justify-between border-b border-white/5 bg-black/60 px-4 py-1.5 sm:flex">
      <div className="flex items-center gap-3">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            aria-label={social.label}
            className="text-white/40 transition-colors duration-200 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          >
            <social.icon className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>

      <ScrollingBanner />

      <Link
        href="/signup"
        className="shrink-0 origin-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200 shadow-[0_0_12px_-2px_rgba(34,211,238,0.6)] transition-all duration-300 hover:scale-x-105 hover:bg-cyan-400/20 hover:shadow-[0_0_18px_-2px_rgba(34,211,238,0.9)]"
      >
        Essayer maintenant
      </Link>
    </div>
  );
}

export function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full"
    >
      <TopBar />

      <div className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo className="h-12 md:h-14" />
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

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </motion.header>
  );
}
