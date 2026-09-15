"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function CtaFooter() {
  return (
    <>
      <section className="container pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-secondary/40 px-6 py-16 text-center"
        >
          <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à arrêter de deviner vos marges ?
          </h2>
          <p className="max-w-md text-muted-foreground">
            Créez votre compte gratuitement et testez votre premier produit en
            quelques secondes.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Commencer maintenant</Link>
          </Button>
        </motion.div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MargeMax. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground">
              Connexion
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Créer un compte
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
