"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

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
          animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="h-[420px] w-[720px] rounded-full bg-gradient-to-tr from-primary/40 via-primary/10 to-transparent"
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
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Marge réelle vérifiée, pas estimée
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Trouvez vos meilleures opportunités de{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            sourcing AliExpress
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-xl text-lg text-muted-foreground"
        >
          MargeMax analyse un produit AliExpress et calcule instantanément le
          prix, la livraison, les frais d&apos;importation réels, votre marge
          et votre ROI — sans jamais inventer une donnée.
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">
              Essayer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">J&apos;ai déjà un compte</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
