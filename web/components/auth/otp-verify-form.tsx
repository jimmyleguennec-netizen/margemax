"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, RotateCw } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { RgbLoader } from "@/components/ui/rgb-loader";

const RESEND_COOLDOWN_S = 30;
/**
 * Doit correspondre exactement a la longueur de code configuree cote
 * Supabase (Authentication -> Settings -> OTP length). Si le projet
 * envoie toujours des codes a 6 chiffres, ce composant refusera de
 * soumettre un code de 6 chiffres valide -- verifier la config Supabase
 * avant de considerer ce changement comme fonctionnel.
 */
const OTP_LENGTH = 8;

type Status = "idle" | "verifying" | "verified" | "error";

export function OtpVerifyForm({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (status !== "verified") return;
    const timer = window.setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = code.trim();
    if (token.length !== OTP_LENGTH || status === "verifying") return;

    setStatus("verifying");
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) {
        console.error("[otp] verifyOtp a renvoyé une erreur :", error);
        setErrorMessage(
          `Code incorrect ou expiré. Vérifiez les ${OTP_LENGTH} chiffres, ou demandez un nouveau code.`
        );
        setStatus("error");
        return;
      }

      setStatus("verified");
    } catch (err) {
      console.error("[otp] Exception réseau pendant verifyOtp :", err);
      setErrorMessage("Validation impossible pour le moment. Réessayez dans quelques instants.");
      setStatus("error");
    }
  }

  async function handleResend() {
    if (resendState === "sending" || cooldown > 0) return;
    setResendState("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        console.error("[otp] resend a renvoyé une erreur :", error);
      }
    } catch (err) {
      console.error("[otp] Exception réseau pendant resend :", err);
    } finally {
      setResendState("sent");
      setCooldown(RESEND_COOLDOWN_S);
      window.setTimeout(() => setResendState("idle"), 3000);
    }
  }

  if (status === "verified") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col items-center gap-3 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
        <p className="text-sm text-white/70">
          Adresse confirmée. Redirection vers votre espace...
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Vérifiez votre e-mail</h2>
        <p className="mt-1 text-sm text-white/50">
          Entrez le code à {OTP_LENGTH} chiffres envoyé à{" "}
          <span className="text-cyan-300">{email}</span>.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="otp-code"
          className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
        >
          Code de confirmation
        </label>
        <input
          id="otp-code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
          }
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          placeholder="12345678"
          className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/20 outline-none backdrop-blur-sm transition-all duration-200 focus:border-cyan-400/60 focus:bg-white/[0.07] focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
        />
      </div>

      {errorMessage && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-md border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-xs text-pink-300"
        >
          {errorMessage}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={code.length !== OTP_LENGTH || status === "verifying"}
        className="group relative flex w-full origin-center items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.7)] transition-all duration-300 hover:scale-x-105 hover:bg-[position:100%_0] hover:shadow-[0_0_30px_-2px_rgba(34,211,238,0.8)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-x-100"
      >
        {status === "verifying" && <RgbLoader size={16} />}
        {status === "verifying" ? "Vérification..." : "Valider le code"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendState === "sending" || cooldown > 0}
        className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-cyan-300 underline-offset-4 transition-opacity hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
      >
        <RotateCw className="h-3 w-3" />
        {cooldown > 0
          ? `Renvoyer le code (${cooldown}s)`
          : resendState === "sent"
            ? "Code renvoyé !"
            : "Renvoyer le code"}
      </button>
    </form>
  );
}
