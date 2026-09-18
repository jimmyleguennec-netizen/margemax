"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { updatePassword, type AuthActionState } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { NeonMessage, NeonSubmitButton } from "@/components/auth/neon-form-fields";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, action] = useFormState(updatePassword, initialState);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    const timer = setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.success, router]);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-xl">
      <h1 className="text-2xl font-bold text-white">Nouveau mot de passe</h1>
      <p className="mt-1 text-sm text-white/50">
        Choisissez un mot de passe d&apos;au moins 6 caractères.
      </p>

      {state.success ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2.5 text-sm text-cyan-200"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Mot de passe mis à jour. Redirection vers la connexion...
        </motion.div>
      ) : (
        <form action={action} className="mt-6 space-y-4">
          <PasswordInput
            id="reset-password-new"
            name="password"
            label="Nouveau mot de passe"
            autoComplete="new-password"
            minLength={6}
          />
          <PasswordInput
            id="reset-password-confirm"
            name="confirmPassword"
            label="Confirmer le mot de passe"
            autoComplete="new-password"
            minLength={6}
          />
          <NeonMessage state={state} />
          <NeonSubmitButton loadingLabel="Mise à jour...">Mettre à jour</NeonSubmitButton>
        </form>
      )}
    </div>
  );
}
