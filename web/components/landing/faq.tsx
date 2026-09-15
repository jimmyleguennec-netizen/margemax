"use client";

import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment fonctionne le calcul des marges réelles ?",
    answer:
      "MargeMax combine le prix produit, la livraison et les frais d'importation réellement appliqués -- jamais une estimation au hasard. Dès que le total réellement payé au checkout est retrouvé, un badge de vérification croisée confirme que le calcul de marge et de ROI correspond bien à la réalité.",
  },
  {
    question: "Pourquoi acheter des crédits au lieu d'un abonnement ?",
    answer:
      "Parce que vous ne payez que ce que vous utilisez, sans mensualité qui tourne dans le vide les mois calmes. Aucun engagement, aucun renouvellement automatique -- vous achetez un pack quand vous en avez besoin, point final.",
  },
  {
    question: "Les crédits ont-ils une date d'expiration ?",
    answer:
      "Non, jamais. Les crédits achetés vous appartiennent à vie, sans date limite ni compte à rebours -- utilisez-les à votre rythme.",
  },
  {
    question:
      "Que se passe-t-il si un produit AliExpress ne peut pas être analysé ?",
    answer:
      "Vous êtes prévenu immédiatement et aucun crédit n'est débité. MargeMax n'invente jamais une donnée manquante : si une information ne peut pas être récupérée (page indisponible, produit retiré...), elle reste clairement signalée comme absente plutôt que devinée.",
  },
  {
    question: "Comment fonctionne le générateur de fiches produits IA ?",
    answer:
      "À partir des données déjà vérifiées de votre analyse (titre, image, caractéristiques, prix), il génère en un clic une fiche produit prête à publier -- que vous pouvez ensuite relire et ajuster avant mise en ligne.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function Faq() {
  return (
    <section id="faq" className="container scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Questions fréquentes
        </h2>
        <p className="mt-3 text-white/50">
          Tout ce qu&apos;il faut savoir avant d&apos;acheter vos premiers
          crédits.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-2xl"
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={faq.question} variants={item}>
              <AccordionItem
                value={`faq-${i}`}
                className="group rounded-xl border border-white/10 bg-white/[0.03] px-5 backdrop-blur-sm transition-all duration-300 data-[state=open]:border-cyan-400/40 data-[state=open]:shadow-[0_0_35px_-10px_rgba(139,92,246,0.6),0_0_20px_-8px_rgba(0,240,255,0.6)]"
              >
                <AccordionTrigger className="text-white/90 hover:text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/50">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
