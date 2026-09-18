"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { MIconBadge } from "@/components/ui/m-icon-badge";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const bullets = [
  "Le coût d'achat détaillé (Produit + Port + TVA/Douane)",
  "L'offre AliExpress la moins chère parmi des annonces effectivement comparées",
  "Le budget pub maximum par vente (TikTok/Meta)",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Halo decoratif statique -- l'ancienne version liait sa position au
          scroll (useTransform sur scrollYProgress) par-dessus un filtre
          blur-3xl : recalculer un transform sur un calque flou a chaque
          frame de scroll est une combinaison connue pour faire clignoter
          l'ecran en noir sur Safari/Chrome mobile. Le halo reste desormais
          fixe pendant le scroll ; seule une respiration douce (opacity/
          scale, sans dependance au scroll) subsiste. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-2xl sm:blur-3xl"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="h-[420px] w-[720px] rounded-full bg-gradient-to-tr from-cyan-500/40 via-fuchsia-500/20 to-transparent"
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container flex flex-col items-center gap-6 py-24 text-center sm:py-32"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          ⚡ SOURCING AUTOMATISÉ ALIEXPRESS — CALCUL DE MARGE RÉELLE
        </motion.div>

        <motion.div variants={item} className="relative max-w-3xl">
          <div className="pointer-events-none absolute inset-y-0 -left-44 hidden w-36 items-center lg:flex">
            <div className="rounded-xl border border-cyan-400/30 bg-slate-900/90 px-3 py-2 text-left text-xs font-medium text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-sm">
              ✓ Sans abonnement, crédits à l&apos;usage
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 -right-44 hidden w-36 items-center lg:flex">
            <div className="rounded-xl border border-fuchsia-400/30 bg-slate-900/90 px-3 py-2 text-left text-xs font-medium text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.2)] backdrop-blur-sm">
              🎯 Consulte le détail des coûts avant d&apos;acheter
            </div>
          </div>

          <h1 className="text-center tracking-tight">
            <span className="mb-3 block text-lg font-medium text-slate-300 md:text-xl">
              Marre de perdre de l&apos;argent avec de fausses marges ?
            </span>
            <span className="block text-4xl font-extrabold text-white sm:text-6xl">
              Comparez les offres AliExpress et{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-400 bg-clip-text font-black text-transparent drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]">
                estimez votre marge avant de vendre
              </span>
              .
            </span>
          </h1>
        </motion.div>

        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-100 shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)] backdrop-blur-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-cyan-300" />
          Comprenez les coûts avant de choisir un produit.
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <span className="relative inline-flex overflow-hidden rounded-full p-[1.5px]">
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#22d3ee_0%,#d946ef_50%,#22d3ee_100%)]" />
            <Link
              href="/signup"
              className="relative z-10 inline-flex items-center gap-2 rounded-full bg-[#05050a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0a0a14]"
            >
              Essayer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </span>

          <Link
            href="/login"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-cyan-400/40 hover:text-white hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]"
          >
            J&apos;ai déjà un compte
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-6 w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 text-left shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <MIconBadge />
            <div>
              <h2 className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-xl font-bold text-transparent drop-shadow-[0_0_16px_rgba(52,211,153,0.35)]">
                C&apos;est quoi, MargeMax ?
              </h2>
              <p className="mt-1 text-sm text-white/60">
                MargeMax est votre assistant intelligent connecté à
                AliExpress. En quelques secondes, il scanne le marché et
                déniche pour vous :
              </p>
            </div>
          </div>
          <ul className="mt-5 flex flex-col gap-2">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3.5 py-2 text-sm text-white/70 transition-colors duration-300 hover:border-cyan-400/40"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                {bullet}
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-cyan-300 shadow-[0_0_20px_-4px_rgba(34,211,238,0.7)] transition-all duration-300 hover:scale-x-105 hover:bg-cyan-400/20 hover:shadow-[0_0_30px_-2px_rgba(34,211,238,0.9)]"
          >
            Tester MargeMax maintenant
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
