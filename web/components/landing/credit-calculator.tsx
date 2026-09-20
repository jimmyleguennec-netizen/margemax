"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBuyButton } from "@/components/ui/animated-buy-button";
import { buildPackCheckoutHref } from "@/lib/stripe-links";
import {
  PACKS,
  formatEuro,
  recommendPackForVolume,
  recommendPackCombinationForVolume,
  type Pack,
} from "@/lib/packs";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";
import {
  CheckoutConsentDialog,
  type ConsentPack,
} from "@/components/purchase/checkout-consent-dialog";

const MIN_VOLUME = 1;
const MAX_VOLUME = 220;

function formatAnalyses(n: number): string {
  return `${n} analyse${n > 1 ? "s" : ""}`;
}

export function CreditCalculator() {
  const [volume, setVolume] = useState(20);
  const { user } = useSupabaseUser();
  const [consentPack, setConsentPack] = useState<ConsentPack | null>(null);
  const router = useRouter();

  function handleChoosePack(pack: Pack) {
    if (user?.id) {
      setConsentPack({
        key: pack.key,
        label: pack.label,
        credits: pack.credits,
        priceEuros: pack.priceEuros,
      });
    } else {
      router.push(buildPackCheckoutHref(pack.key, undefined));
    }
  }

  const { pack: recommended, coversVolume } = useMemo(
    () => recommendPackForVolume(volume),
    [volume]
  );
  const combination = useMemo(
    () => (coversVolume ? null : recommendPackCombinationForVolume(volume)),
    [volume, coversVolume]
  );
  const progress = ((volume - MIN_VOLUME) / (MAX_VOLUME - MIN_VOLUME)) * 100;

  return (
    <section className="container py-20 sm:py-28">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] sm:text-4xl">
          Quel pack te correspond ?
        </h2>
        <p className="mt-3 text-white/70">
          Une estimation d&apos;usage pour t'orienter vers un pack :
          les crédits n&apos;expirent pas et ne sont liés à aucun
          abonnement.
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-white/60">
            <Gauge aria-hidden="true" className="h-4 w-4 text-cyan-300" />
            Combien d&apos;analyses prévois-tu ?
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
            aria-label="Nombre d'analyses prévues"
            className="absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_12px_2px_rgba(34,211,238,0.8)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]"
          />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PACKS.map((pack) => {
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
                    Pour toi
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
                    isMatch ? "text-cyan-200" : "text-white/60"
                  )}
                >
                  {pack.credits} crédits
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {formatEuro(pack.priceEuros)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {coversVolume ? (
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-white/70">
              Avec <span className="text-white">{formatAnalyses(volume)}</span>, le
              pack{" "}
              <span className="font-semibold text-cyan-300">
                {recommended.label}
              </span>{" "}
              ({recommended.credits} crédits) couvre ce volume.
            </p>
            <AnimatedBuyButton
              label={`Choisir ${recommended.label}`}
              successLabel="C'est parti !"
              href={buildPackCheckoutHref(recommended.key, user?.id)}
              onIntercept={user?.id ? () => handleChoosePack(recommended) : undefined}
              className="sm:w-auto sm:px-8"
            />
          </div>
        ) : (
          combination && (
            <div className="mt-8 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5">
              <p className="text-sm text-white/70">
                Aucun pack seul ne couvre{" "}
                <span className="text-white">{formatAnalyses(volume)}</span>.
                Combine{" "}
                {combination.items
                  .map((item) =>
                    item.quantity > 1
                      ? `${item.quantity} × ${item.pack.label}`
                      : item.pack.label
                  )
                  .join(" + ")}{" "}
                pour obtenir{" "}
                <span className="font-semibold text-cyan-300">
                  {combination.totalCredits} crédits
                </span>{" "}
                pour {formatEuro(combination.totalPrice)}.
              </p>
              <ul className="mt-4 space-y-2">
                {combination.items.map((item) => (
                  <li
                    key={item.pack.key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm"
                  >
                    <span className="text-white/70">
                      {item.quantity > 1 ? `${item.quantity} × ` : ""}
                      Pack {item.pack.label} ({item.pack.credits} crédits)
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60">
                        {formatEuro(item.pack.priceEuros * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleChoosePack(item.pack)}
                        className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-semibold text-cyan-200 transition-all hover:border-cyan-400/60 hover:shadow-[0_0_14px_-2px_rgba(34,211,238,0.6)]"
                      >
                        Choisir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-center justify-between text-sm font-semibold text-white">
                <span>Total</span>
                <span>
                  {combination.totalCredits} crédits ·{" "}
                  {formatEuro(combination.totalPrice)}
                </span>
              </p>
              <p className="mt-2 text-xs text-white/50">
                Chaque pack s&apos;achète séparément (aucun panier
                groupé pour l&apos;instant) : clique sur chaque
                &laquo; Choisir &raquo; pour l&apos;acheter.
              </p>
            </div>
          )
        )}
      </div>

      <CheckoutConsentDialog
        pack={consentPack}
        userId={user?.id}
        onCancel={() => setConsentPack(null)}
      />
    </section>
  );
}
