"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBuyButton } from "@/components/ui/animated-buy-button";
import { buildPackCheckoutHref } from "@/lib/stripe-links";

const packs = [
  { key: "starter", label: "Starter", credits: 5, price: "2,99 €" },
  { key: "essentiel", label: "Essentiel", credits: 15, price: "7,99 €" },
  { key: "avance", label: "Avancé", credits: 35, price: "14,99 €" },
  { key: "pro", label: "Pro", credits: 80, price: "29,99 €" },
  { key: "ultimate", label: "Ultimate", credits: 200, price: "59,99 €" },
] as const;

const MIN_VOLUME = 1;
const MAX_VOLUME = 220;

function recommendPack(volume: number) {
  return packs.find((pack) => volume <= pack.credits) ?? packs[packs.length - 1];
}

export function CreditCalculator() {
  const [volume, setVolume] = useState(20);
  const recommended = useMemo(() => recommendPack(volume), [volume]);
  const progress = ((volume - MIN_VOLUME) / (MAX_VOLUME - MIN_VOLUME)) * 100;

  return (
    <section className="container py-20 sm:py-28">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Quel pack vous correspond ?
        </h2>
        <p className="mt-3 text-white/50">
          Estimez votre volume d&apos;analyses par mois, on vous indique le
          pack le plus adapté.
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-white/60">
            <Gauge className="h-4 w-4 text-cyan-300" />
            Analyses par mois
          </span>
          <span className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
            {volume}
          </span>
        </div>

        <div className="relative mt-4">
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 shadow-[0_0_16px_-2px_rgba(217,70,239,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume d'analyses par mois"
            className="absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_12px_2px_rgba(34,211,238,0.8)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]"
          />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {packs.map((pack) => {
            const isMatch = pack.key === recommended.key;
            return (
              <motion.div
                key={pack.key}
                animate={
                  isMatch
                    ? { scale: 1.06, y: -4 }
                    : { scale: 1, y: 0 }
                }
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "relative rounded-xl border p-4 text-center transition-colors duration-300",
                  isMatch
                    ? "z-10 border-cyan-400/60 bg-cyan-400/[0.08] shadow-[0_0_45px_-8px_rgba(34,211,238,0.9),0_0_25px_-6px_rgba(217,70,239,0.7)]"
                    : "border-white/10 bg-white/[0.02]"
                )}
              >
                {isMatch && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-[0_0_10px_-1px_rgba(34,211,238,0.9)]">
                    Pour vous
                  </span>
                )}
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isMatch ? "text-white" : "text-white/60"
                  )}
                >
                  {pack.label}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isMatch ? "text-cyan-200" : "text-white/40"
                  )}
                >
                  {pack.credits} crédits
                </p>
                <p className="mt-1 text-xs text-white/30">{pack.price}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-white/50">
            Avec <span className="text-white">{volume} analyses/mois</span>,
            le pack{" "}
            <span className="font-semibold text-cyan-300">
              {recommended.label}
            </span>{" "}
            ({recommended.credits} crédits) couvre votre besoin.
          </p>
          <AnimatedBuyButton
            label={`Choisir ${recommended.label}`}
            successLabel="C'est parti !"
            href={buildPackCheckoutHref(recommended.key)}
            className="sm:w-auto sm:px-8"
          />
        </div>
      </div>
    </section>
  );
}
