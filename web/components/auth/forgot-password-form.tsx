"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Mail } from "lucide-react";

import { requestPasswordReset, type AuthActionState } from "@/lib/actions/auth";
import { NeonField, NeonMessage, NeonSubmitButton } from "@/components/auth/neon-form-fields";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, action] = useFormState(requestPasswordReset, initialState);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-xl">
      <h1 className="text-2xl font-bold text-white">Mot de passe oublié ?</h1>
      <p className="mt-1 text-sm text-white/50">
        Entre ton e-mail, on t&apos;envoie un lien pour en choisir un nouveau.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <NeonField
          id="forgot-password-email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
        />
        <NeonMessage state={state} />
        <NeonSubmitButton loadingLabel="Envoi en cours...">Envoyer le lien</NeonSubmitButton>
      </form>

      <Link
        href="/login"
        className="mt-4 block text-center text-xs font-medium text-cyan-300 underline-offset-4 hover:underline"
      >
        Retour à la connexion
      </Link>
    </div>
  );
}
