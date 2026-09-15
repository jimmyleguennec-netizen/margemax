"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";

type Status = "idle" | "success";

export function AnimatedBuyButton({
  label,
  successLabel = "Ajouté !",
  href,
  onConfirm,
  className,
}: {
  label: string;
  successLabel?: string;
  href?: string;
  onConfirm?: () => void;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();

  function handleClick() {
    if (status !== "idle") return;
    setStatus("success");

    window.setTimeout(() => {
      onConfirm?.();
      if (href) {
        router.push(href);
      } else {
        setStatus("idle");
      }
    }, 900);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status !== "idle"}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed",
        status === "success"
          ? "border border-green-400/60 bg-green-400/10 text-green-300 shadow-[0_0_24px_-4px_rgba(74,222,128,0.8)]"
          : "bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.8)] hover:bg-[position:100%_0] hover:shadow-[0_0_28px_-2px_rgba(34,211,238,0.9)]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" ? (
          <motion.span
            key="idle"
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {label}
          </motion.span>
        ) : (
          <motion.span
            key="success"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.35, 1] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex"
            >
              <Check className="h-4 w-4" />
            </motion.span>
            {successLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
