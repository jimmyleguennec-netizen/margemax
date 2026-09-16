"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
  "Le prix réel payé au checkout (Produit + Port + TVA/Douane)",
  "L'offre AliExpress la moins chère parmi des milliers d'annonces",
  "Le CPA Max Pub (budget TikTok/Meta à ne pas dépasser par vente)",
  "Une Fiche Produit IA prête à l'emploi (titre SEO & description Shopify)",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
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
        <motion.h1
          variants={item}
          className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
        >
          Tu veux lancer ta boutique e-commerce, mais tu galères à dénicher
          des produits vraiment rentables ?
        </motion.h1>

        <motion.p variants={item} className="max-w-2xl text-lg text-white/60">
          Marre des marges théoriques qui s&apos;effondrent au moment de
          payer la livraison et les taxes ? Bienvenue sur MargeMax.
        </motion.p>

        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-100 shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)] backdrop-blur-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-cyan-300" />
          Zéro mauvaise surprise au checkout : calcul des frais de port et
          taxes réels
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
            <Image
              src="/images/product-charger.jpg"
              alt="Aperçu produit analysé par MargeMax"
              width={80}
              height={80}
              className="rounded-xl border border-cyan-500/40 object-cover shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            />
            <div>
              <h2 className="text-xl font-bold text-cyan-400">
                C&apos;est quoi, MargeMax ?
              </h2>
              <p className="mt-1 text-sm text-white/60">
                MargeMax est ton assistant robotisé intelligent connecté à
                AliExpress. En quelques secondes, il scanne le marché et
                déniche pour toi :
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-2.5">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-sm text-white/70"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                {bullet}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
