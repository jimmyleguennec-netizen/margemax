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
    question: "Dois-je m'engager sur un abonnement ?",
    answer:
      "Non. MargeMax fonctionne avec des crédits prépayés, achetés une seule fois, sans engagement ni renouvellement automatique. Vous ne payez que ce que vous utilisez.",
  },
  {
    question: "Mes crédits expirent-ils ?",
    answer:
      "Jamais. Les crédits achetés vous appartiennent à vie -- aucune date d'expiration, aucun abonnement mensuel à surveiller.",
  },
  {
    question: "Comment fonctionne un crédit ?",
    answer:
      "Un crédit correspond à une analyse complète d'un produit : prix, livraison, frais d'importation réels, marge nette et ROI calculés en une seule fois.",
  },
  {
    question: "Les chiffres affichés sont-ils vraiment vérifiés ?",
    answer:
      "Oui. Chaque champ indique sa source, et dès que le total réellement payé au checkout est retrouvé, un badge de vérification croisée le confirme -- jamais une donnée inventée ou estimée à l'aveugle.",
  },
  {
    question: "Puis-je acheter plusieurs packs de crédits ?",
    answer:
      "Bien sûr, les crédits s'additionnent simplement à votre solde existant. Achetez le pack qui correspond à votre volume du moment, sans jamais perdre ce qui vous reste.",
  },
  {
    question: "Que faire si j'ai une question avant d'acheter ?",
    answer:
      "Écrivez-nous via le formulaire de contact ci-dessous -- nous répondons sous 24h ouvrées, avant comme après votre achat.",
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
                className="group rounded-xl border border-white/10 bg-white/[0.03] px-5 backdrop-blur-sm transition-all duration-300 data-[state=open]:border-cyan-400/40 data-[state=open]:shadow-[0_0_35px_-10px_rgba(217,70,239,0.5),0_0_20px_-8px_rgba(34,211,238,0.5)]"
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
