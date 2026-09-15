"use client";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          MargeMax
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          La nouvelle interface web est en cours de construction. Structure
          Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Framer Motion
          initialisée.
        </p>
      </motion.div>
    </main>
  );
}
