"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";

import { login, signup, type AuthActionState } from "@/lib/actions/auth";
import { RgbLoader } from "@/components/ui/rgb-loader";
import { PasswordInput } from "@/components/ui/password-input";

type Mode = "login" | "signup";
type FormDispatch = (payload: FormData) => void;

const initialState: AuthActionState = {};

function NeonField({
  id,
  name,
  type,
  label,
  icon: Icon,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  icon: typeof Mail;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-cyan-200/70"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
        <input
          id={id}
          name={name}
          type={type}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          className="w-full rounded-lg border border-cyan-400/20 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-sm transition-all duration-200 focus:border-cyan-400/60 focus:bg-white/[0.07] focus:shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]"
        />
      </div>
    </div>
  );
}

function NeonSubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_20px_-4px_rgba(217,70,239,0.7)] transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-[0_0_30px_-2px_rgba(34,211,238,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <RgbLoader size={16} />}
      {children}
    </button>
  );
}

function NeonMessage({ state }: { state: AuthActionState }) {
  return (
    <AnimatePresence mode="wait">
      {state?.error && (
        <motion.p
          key="error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-md border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-xs text-pink-300"
        >
          {state.error}
        </motion.p>
      )}
      {state?.message && (
        <motion.p
          key="message"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200"
        >
          {state.message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function LoginForm({
  action,
  state,
  idPrefix,
}: {
  action: FormDispatch;
  state: AuthActionState;
  idPrefix: string;
}) {
  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Connexion</h2>
        <p className="mt-1 text-sm text-white/50">
          Accédez à votre espace MargeMax.
        </p>
      </div>
      <NeonField
        id={`${idPrefix}-login-email`}
        name="email"
        type="email"
        label="Email"
        icon={Mail}
        autoComplete="email"
      />
      <PasswordInput
        id={`${idPrefix}-login-password`}
        name="password"
        label="Mot de passe"
        autoComplete="current-password"
      />
      <NeonMessage state={state} />
      <NeonSubmitButton>Se connecter</NeonSubmitButton>
    </form>
  );
}

function SignupForm({
  action,
  state,
  idPrefix,
}: {
  action: FormDispatch;
  state: AuthActionState;
  idPrefix: string;
}) {
  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Créer un compte</h2>
        <p className="mt-1 text-sm text-white/50">
          Commencez à calculer vos marges en quelques secondes.
        </p>
      </div>
      <NeonField
        id={`${idPrefix}-signup-email`}
        name="email"
        type="email"
        label="Email"
        icon={Mail}
        autoComplete="email"
      />
      <PasswordInput
        id={`${idPrefix}-signup-password`}
        name="password"
        label="Mot de passe"
        autoComplete="new-password"
        minLength={6}
      />
      <PasswordInput
        id={`${idPrefix}-signup-confirm`}
        name="confirmPassword"
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        minLength={6}
      />
      <NeonMessage state={state} />
      <NeonSubmitButton>Créer mon compte</NeonSubmitButton>
    </form>
  );
}

function OverlayFace({
  title,
  text,
  cta,
  onClick,
}: {
  title: string;
  text: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center"
    >
      <h3 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
        {title}
      </h3>
      <p className="text-sm text-white/80">{text}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-2 rounded-full border-2 border-white/80 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:bg-white hover:text-fuchsia-600 hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
      >
        {cta}
      </button>
    </motion.div>
  );
}

function SuccessOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.8)]"
      >
        <motion.svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
          <motion.path
            d="M4 12.5L9.5 18L20 6"
            stroke="#22d3ee"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeInOut" }}
          />
        </motion.svg>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-lg font-bold uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
      >
        Connected
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-white/50"
      >
        Redirection en cours...
      </motion.p>
    </motion.div>
  );
}

export function NeonAuthPanel({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loginState, loginActionFn] = useFormState(login, initialState);
  const [signupState, signupActionFn] = useFormState(signup, initialState);
  const router = useRouter();

  const isSuccess = Boolean(loginState.success || signupState.success);

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1400);
    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  return (
    <div className="relative w-full max-w-3xl">
      {/* Halo neon ambiant */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-pink-500/30 blur-3xl"
      />

      {/* Bordure neon degradee */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 p-[1.5px] shadow-[0_0_60px_-10px_rgba(217,70,239,0.5)]">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a14]">
          <div className="relative grid min-h-[560px] md:grid-cols-2">
            {/* Desktop : les deux formulaires sont toujours montes cote a
                cote, l'overlay glisse pour ne laisser voir que l'un des
                deux. */}
            <div className="hidden items-center justify-center p-8 sm:p-10 md:flex">
              <LoginForm action={loginActionFn} state={loginState} idPrefix="desktop" />
            </div>
            <div className="hidden items-center justify-center p-8 sm:p-10 md:flex">
              <SignupForm action={signupActionFn} state={signupState} idPrefix="desktop" />
            </div>

            <motion.div
              className="absolute inset-y-0 left-0 hidden w-1/2 overflow-hidden md:block"
              animate={{ x: mode === "login" ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="neon-gradient-bg relative h-full w-full">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]"
                />
                <div className="relative h-full">
                  <AnimatePresence mode="wait">
                    {mode === "login" ? (
                      <OverlayFace
                        key="to-signup"
                        title="Nouveau ici ?"
                        text="Créez votre compte et recevez 3 crédits offerts pour analyser vos premiers produits."
                        cta="S'inscrire"
                        onClick={() => setMode("signup")}
                      />
                    ) : (
                      <OverlayFace
                        key="to-login"
                        title="Déjà un compte ?"
                        text="Connectez-vous pour retrouver votre carnet de sourcing et vos crédits."
                        cta="Se connecter"
                        onClick={() => setMode("login")}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Mobile : un seul formulaire visible a la fois + lien de
                bascule (pas d'overlay coulissant, non adapte au petit
                ecran). */}
            <div className="flex flex-col items-center gap-6 p-8 md:hidden">
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.div
                    key="mobile-login"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    className="w-full"
                  >
                    <LoginForm action={loginActionFn} state={loginState} idPrefix="mobile" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-signup"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="w-full"
                  >
                    <SignupForm action={signupActionFn} state={signupState} idPrefix="mobile" />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-xs font-medium uppercase tracking-wider text-cyan-300 underline-offset-4 hover:underline"
              >
                {mode === "login"
                  ? "Pas de compte ? Créer un compte"
                  : "Déjà un compte ? Se connecter"}
              </button>
            </div>

            <AnimatePresence>{isSuccess && <SuccessOverlay />}</AnimatePresence>
          </div>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-white/30">
        <ShieldCheck className="h-3.5 w-3.5" />
        Connexion sécurisée via Supabase
      </p>
    </div>
  );
}
