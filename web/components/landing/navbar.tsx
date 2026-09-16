"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Logo } from "@/components/ui/logo";

const links = [
  { href: "#demo", label: "Démo" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <Logo />
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
              className="relative rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {hovered === link.href && (
                <motion.span
                  layoutId="navbar-hover-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-white/10 shadow-[0_0_16px_-2px_rgba(34,211,238,0.5)]"
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
            className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.8)] transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-[0_0_24px_-2px_rgba(34,211,238,0.8)]"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
