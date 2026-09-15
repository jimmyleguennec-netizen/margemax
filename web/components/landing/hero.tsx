"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

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
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-1.5 text-sm font-medium text-cyan-100 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          Marge{" "}
          <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
            réelle
          </span>{" "}
          vérifiée, pas estimée
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl"
        >
          Trouvez vos meilleures opportunités de{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(217,70,239,0.4)]">
            sourcing AliExpress
          </span>
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg text-white/60">
          MargeMax analyse un produit AliExpress et calcule instantanément le
          prix, la livraison, les{" "}
          <span className="text-cyan-300">frais d&apos;importation réels</span>,
          votre marge et votre ROI — sans jamais inventer une donnée.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {/* CTA principal -- bordure lumineuse animee (border beam) */}
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
      </motion.div>
    </section>
  );
}
