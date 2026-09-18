"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calculator,
  FileText,
  Mail,
  PartyPopper,
  ScrollText,
  Ship,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";

const CONTACT_EMAIL = "contact@autoutilshop.fr";

// Paiement traite via Stripe (Payment Links) -- ces moyens de paiement
// sont proposes automatiquement par Stripe Checkout selon l'appareil/
// navigateur du client, sans configuration supplementaire cote MargeMax.
// Badges texte plutot que des logos de marque reconstitues a la main
// (aucune bibliotheque d'icones de marque n'est installee ici) -- chaque
// accent de couleur rappelle la marque sans en reproduire le logo exact.
const PAYMENT_METHODS: { label: string; accent: string }[] = [
  { label: "Apple Pay", accent: "border-white/20 text-white" },
  { label: "Google Pay", accent: "border-blue-400/30 text-blue-300" },
  { label: "Visa", accent: "border-indigo-400/30 text-indigo-300" },
  { label: "Mastercard", accent: "border-orange-400/30 text-orange-300" },
  { label: "CB", accent: "border-cyan-400/30 text-cyan-300" },
  { label: "Stripe", accent: "border-violet-400/30 text-violet-300" },
];

// "Générateur de fiche IA" et "Carnet de notes" retirés : ces
// fonctionnalités sont mentionnées dans les textes marketing mais
// n'ont pas de destination reelle dans le produit actuel -- pas de
// lien vers une page qui n'existe pas.
const toolLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Calculateur de marge (connexion requise)", href: "/dashboard", icon: Calculator },
  { label: "Calcul des frais de livraison", href: "#demo", icon: Ship },
];

const resourceLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Voir la démo", href: "#guide", icon: ScrollText },
  { label: "Mentions légales", href: "/mentions-legales", icon: FileText },
  { label: "CGV / CGU", href: "/cgv", icon: FileText },
  { label: "Confidentialité", href: "/confidentialite", icon: FileText },
];

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; icon: LucideIcon }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-cyan-300"
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <section className="container py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center backdrop-blur-sm"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/20 via-transparent to-fuchsia-500/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-24 -z-10 h-64 rounded-full bg-cyan-500/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -bottom-24 -z-10 h-64 rounded-full bg-fuchsia-500/20 blur-[100px]"
          />
          <div className="flex flex-col items-center gap-6">
            <h2 className="max-w-2xl bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
              Prêt à dénicher vos vrais produits gagnants ?
            </h2>
            <p className="max-w-lg text-white/50">
              Rejoignez les e-commerçants qui analysent leurs coûts
              d&apos;importation au centime près.{" "}
              <span className="font-bold text-amber-300">
                3 crédits offerts
              </span>{" "}
              à l&apos;inscription.
            </p>
            <span className="relative inline-flex overflow-hidden rounded-full p-[1.5px]">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#22d3ee_0%,#d946ef_50%,#22d3ee_100%)]" />
              <Link
                href="/signup"
                className="relative z-10 inline-flex items-center rounded-full bg-[#05050a] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0a0a14]"
              >
                Commencer maintenant
              </Link>
            </span>
          </div>
        </motion.div>
      </section>

      <div className="container pb-16">
        <div className="grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="h-14 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Votre assistant de sourcing AliExpress : coûts récupérés ou
              estimés selon les données disponibles, et marges estimées,
              sans donnée inventée.
            </p>
          </div>

          <FooterColumn title="Outil" items={toolLinks} />
          <FooterColumn title="Ressources & FAQ" items={resourceLinks} />

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
              Contact
            </h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-cyan-300"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-cyan-200/70 sm:text-left">
            Moyens de paiement acceptés
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method.label}
                className={`rounded-full border bg-white/[0.02] px-3 py-1.5 text-xs font-medium ${method.accent}`}
              >
                {method.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Avertissement humoristique -- ton volontairement decontracte,
          distinct des mentions legales serieuses juste en dessous. */}
      <div className="border-t border-white/5 bg-white/[0.02] py-5">
        <div className="container flex items-start gap-2.5 text-xs text-white/40 sm:items-center">
          <PartyPopper className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300/70 sm:mt-0" />
          <p>
            <span className="font-semibold text-white/60">Avertissement :</span>{" "}
            ce site a été connu pour provoquer une expérience époustouflante.
            Nous vous recommandons de vous préparer mentalement et si
            possible d&apos;être assis. Les effets secondaires peuvent
            inclure l&apos;économie d&apos;argent, laisser échapper un rire
            et un klaxon sporadique.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-center text-xs text-white/30 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} MargeMax. Tous droits réservés.</p>
          <p>MargeMax est un service édité par AutOutilShop SAS.</p>
        </div>
      </div>
    </footer>
  );
}
