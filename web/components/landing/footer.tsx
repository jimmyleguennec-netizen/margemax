"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calculator,
  FileText,
  Mail,
  ScrollText,
  Ship,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import {
  ApplePayIcon,
  CarteBancaireIcon,
  GooglePayIcon,
  MastercardIcon,
  VisaIcon,
} from "@/components/ui/payment-icons";

const CONTACT_EMAIL = "contact@autoutilshop.fr";

// Paiement traite via Stripe (Payment Links) -- ces moyens de paiement
// sont proposes automatiquement par Stripe Checkout selon l'appareil/
// navigateur du client, sans configuration supplementaire cote MargeMax.
// Icones SVG dessinees a la main (components/ui/payment-icons.tsx) plutot
// qu'une bibliotheque de logos de marque : ni react-icons ni un pack
// d'icones de paiement ne sont installes dans ce projet, et il n'y a pas
// de Node/npm disponible ici pour ajouter une dependance en toute
// securite (regenerer package-lock.json a l'aveugle).
const PAYMENT_METHODS: { label: string; Icon: (props: { className?: string }) => JSX.Element }[] = [
  { label: "Apple Pay", Icon: ApplePayIcon },
  { label: "Google Pay", Icon: GooglePayIcon },
  { label: "Visa", Icon: VisaIcon },
  { label: "Mastercard", Icon: MastercardIcon },
  { label: "CB", Icon: CarteBancaireIcon },
];

// "Générateur de fiche IA" et "Carnet de notes" retirés : ces
// fonctionnalités sont mentionnées dans les textes marketing mais
// n'ont pas de destination reelle dans le produit actuel -- pas de
// lien vers une page qui n'existe pas.
const toolLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Calculateur de marge (connexion requise)", href: "/dashboard", icon: Calculator },
  { label: "Voir la démo", href: "#demo", icon: Ship },
];

// "Voir la démo" pointait vers #guide (le guide en 4 etapes) au lieu de
// #demo (la vraie section de demonstration) -- lien technique valide (les
// deux ancres existent reellement sur la page) mais mal etiquete. Corrige
// ici : #demo pour "Voir la démo", #guide sous son propre libelle distinct.
const resourceLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Comment ça marche (guide en 4 étapes)", href: "#guide", icon: ScrollText },
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
              className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-cyan-300"
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
              Prêt à dénicher tes vrais produits gagnants ?
            </h2>
            <p className="max-w-lg text-white/70">
              Rejoins les e-commerçants qui estiment leurs coûts
              d&apos;importation à partir des données réellement
              disponibles.{" "}
              <span className="font-bold text-amber-300">
                3 crédits offerts
              </span>{" "}
              à l&apos;inscription.
            </p>
            <span className="relative inline-flex overflow-hidden rounded-full p-[1.5px]">
              <span className="absolute inset-[-1000%] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400" />
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
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Ton assistant de sourcing AliExpress : coûts récupérés ou
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
              className="mt-4 flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-cyan-300"
            >
              <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-cyan-200/70 sm:text-left">
            Moyens de paiement acceptés
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
            {PAYMENT_METHODS.map(({ label, Icon }) => (
              <Icon key={label} className="opacity-90" />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} MargeMax. Tous droits réservés.</p>
          <p>MargeMax est un service édité par AutOutilShop SAS.</p>
          <p className="w-full text-center text-[11px] italic text-white/60 sm:order-last">
            Ce site a été connu pour provoquer une expérience époustouflante.
          </p>
        </div>
      </div>
    </footer>
  );
}
