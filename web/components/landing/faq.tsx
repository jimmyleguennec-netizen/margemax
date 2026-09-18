"use client";

import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionGlow } from "@/components/ui/section-glow";
import { faqs } from "@/lib/faq";

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
    <section id="faq" className="container relative scroll-mt-20 py-20 sm:py-28">
      <SectionGlow />
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
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
