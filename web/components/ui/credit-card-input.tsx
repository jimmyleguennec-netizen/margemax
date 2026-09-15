"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

import { cn } from "@/lib/utils";

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CreditCardInput({ className }: { className?: string }) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [flipped, setFlipped] = useState(false);

  const displayNumber = number || "•••• •••• •••• ••••";
  const displayName = name || "NOM DU TITULAIRE";
  const displayExpiry = expiry || "MM/AA";

  return (
    <div className={cn("mx-auto w-full max-w-sm", className)}>
      <div className="mb-8" style={{ perspective: 1000 }}>
        <motion.div
          className="relative h-52 w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Face avant */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#131022] via-[#1a1030] to-[#0a0a14] p-6 shadow-[0_0_40px_-10px_rgba(217,70,239,0.4)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.15),transparent_60%)]"
            />
            <div className="flex items-center justify-between">
              <div className="h-8 w-11 rounded-md bg-gradient-to-br from-yellow-300/80 to-yellow-500/60" />
              <CreditCard className="h-6 w-6 text-cyan-300" />
            </div>

            <p className="mt-8 font-mono text-xl tracking-[0.15em] text-white">
              <motion.span
                key={displayNumber}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {displayNumber}
              </motion.span>
            </p>

            <div className="mt-6 flex items-end justify-between text-xs">
              <div className="min-w-0">
                <p className="text-white/40">Titulaire</p>
                <motion.p
                  key={displayName}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 truncate font-medium uppercase tracking-wider text-white"
                >
                  {displayName}
                </motion.p>
              </div>
              <div>
                <p className="text-white/40">Expire</p>
                <motion.p
                  key={displayExpiry}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 font-medium text-white"
                >
                  {displayExpiry}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Face arriere */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#131022] via-[#1a1030] to-[#0a0a14] shadow-[0_0_40px_-10px_rgba(34,211,238,0.4)]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="mt-6 h-10 w-full bg-black/60" />
            <div className="mt-6 px-6">
              <div className="flex h-9 items-center justify-end rounded-sm bg-white/90 px-3">
                <span className="font-mono text-sm italic text-black">
                  {cvc.padEnd(3, "•")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-cyan-200/70">
            Numéro de carte
          </label>
          <input
            inputMode="numeric"
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            onFocus={() => setFlipped(false)}
            placeholder="1234 5678 9012 3456"
            className="w-full rounded-lg border border-cyan-400/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-cyan-200/70">
            Titulaire
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFlipped(false)}
            placeholder="Jean Dupont"
            className="w-full rounded-lg border border-cyan-400/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-cyan-200/70">
              Expiration
            </label>
            <input
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              onFocus={() => setFlipped(false)}
              placeholder="MM/AA"
              className="w-full rounded-lg border border-cyan-400/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-400/60 focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-cyan-200/70">
              CVC
            </label>
            <input
              inputMode="numeric"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              placeholder="123"
              className="w-full rounded-lg border border-fuchsia-400/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-fuchsia-400/60 focus:shadow-[0_0_20px_-2px_rgba(217,70,239,0.5)]"
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-white/30">
        Aperçu visuel uniquement — l&apos;encaissement réel s&apos;effectue via
        Stripe Checkout, aucune donnée saisie ici n&apos;est envoyée ni
        stockée.
      </p>
    </div>
  );
}
