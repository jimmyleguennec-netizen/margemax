"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Mail, ShieldCheck } from "lucide-react";

import { login, type AuthActionState } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { PACKS } from "@/lib/packs";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { OtpVerifyForm } from "@/components/auth/otp-verify-form";
import { OTP_RATE_LIMIT_MESSAGE, SIGNUP_SLOW_NOTICE } from "@/lib/auth-errors";
import { NeonField, NeonMessage, NeonSubmitButton } from "@/components/auth/neon-form-fields";
import {
  CheckoutConsentDialog,
  type ConsentPack,
} from "@/components/purchase/checkout-consent-dialog";

type Mode = "login" | "signup";
type FormDispatch = (payload: FormData) => void;

const initialState: AuthActionState = {};

const CALLBACK_ERROR_MESSAGE =
  "Connexion impossible pour le moment, réessaie ou utilise ton e-mail.";

// Meme message que login() (lib/actions/auth.ts) : ne jamais reveler, via
// l'interface, si une adresse e-mail possede ou non un compte.
const ACCOUNT_NOT_FOUND_MESSAGE = "Email ou mot de passe incorrect.";

/**
 * Garde-fou anti double-soumission : `useFormStatus().pending` (dans
 * NeonSubmitButton) desactive deja le bouton, mais seulement APRES le
 * premier rendu suivant le clic -- un double-clic tres rapide ou un
 * Entree maintenu peut declencher deux soumissions natives du <form>
 * avant que React n'ait eu le temps de re-rendre le bouton desactive.
 * `submittingRef` bloque synchronement toute soumission tant que la
 * precedente n'a pas produit un nouvel etat (succes OU erreur).
 */
function useSubmitOnceGuard(state: AuthActionState) {
  const submittingRef = useRef(false);

  useEffect(() => {
    submittingRef.current = false;
  }, [state]);

  function guardSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (submittingRef.current) {
      e.preventDefault();
      return;
    }
    submittingRef.current = true;
  }

  return guardSubmit;
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
  const guardSubmit = useSubmitOnceGuard(state);

  return (
    <form action={action} onSubmit={guardSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Connexion</h2>
        <p className="mt-1 text-sm text-white/70">
          Accède à ton espace MargeMax.
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
      <Link
        href="/forgot-password"
        className="-mt-2 block text-right text-xs font-medium text-cyan-300 underline-offset-4 hover:underline"
      >
        Mot de passe oublié ?
      </Link>
      <Checkbox
        id={`${idPrefix}-login-remember`}
        name="remember"
        label="Se souvenir de moi"
      />
      <NeonMessage state={state} />
      <NeonSubmitButton loadingLabel="Connexion en cours...">Se connecter</NeonSubmitButton>
      <OAuthButtons mode="login" />
    </form>
  );
}

function SignupForm({
  onSubmit,
  pending,
  state,
  idPrefix,
  onSwitchToLogin,
}: {
  /** Envoi du formulaire (fetch vers /api/auth/signup, sans Server Action). */
  onSubmit: (formData: FormData) => void;
  pending: boolean;
  state: AuthActionState;
  idPrefix: string;
  /** Bascule vers l'onglet de connexion (compte deja existant). */
  onSwitchToLogin?: () => void;
}) {
  // Soumission unique : `pending` (etat du parent) bloque tout second envoi
  // tant que la reponse n'est pas arrivee ; preventDefault evite la
  // soumission native du <form>.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    onSubmit(new FormData(e.currentTarget));
  }

  // Confirmation par email requise cote Supabase (signUp() sans session
  // immediate) : bascule vers la saisie du code OTP plutot que d'afficher
  // a nouveau le formulaire d'inscription.
  if (state.pendingEmail) {
    return (
      <OtpVerifyForm
        email={state.pendingEmail}
        notice={
          state.message === OTP_RATE_LIMIT_MESSAGE || state.message === SIGNUP_SLOW_NOTICE
            ? state.message
            : undefined
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Créer un compte</h2>
        <p className="mt-1 text-sm text-white/70">
          Commence à calculer tes marges en quelques secondes.
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
      <NeonField
        id={`${idPrefix}-signup-company`}
        name="company"
        type="text"
        label="Entreprise"
        icon={Building2}
        autoComplete="organization"
        required={false}
        placeholder="Nom de ton entreprise (facultatif)"
      />
      <PasswordInput
        id={`${idPrefix}-signup-password`}
        name="password"
        label="Mot de passe"
        autoComplete="new-password"
        minLength={6}
        hint="Minimum 6 caractères. 123456 si tu aimes vivre dangereusement… Non, choisis plutôt un mot de passe solide !"
      />
      <PasswordInput
        id={`${idPrefix}-signup-confirm`}
        name="confirmPassword"
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        minLength={6}
      />
      <Checkbox
        id={`${idPrefix}-signup-remember`}
        name="remember"
        label="Se souvenir de moi"
      />
      <NeonMessage state={state} />
      {state.accountExists && onSwitchToLogin && (
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full rounded-lg border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/10"
        >
          Se connecter
        </button>
      )}
      <NeonSubmitButton loadingLabel="Envoi en cours..." pending={pending}>
        Créer mon compte
      </NeonSubmitButton>
      <OAuthButtons mode="signup" />
      <p className="text-center text-[11px] leading-relaxed text-white/60">
        En créant un compte, tu acceptes nos{" "}
        <Link
          href="/cgv"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-300 underline-offset-4 hover:underline"
        >
          CGU / CGV
        </Link>{" "}
        et notre{" "}
        <Link
          href="/confidentialite"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-300 underline-offset-4 hover:underline"
        >
          Politique de confidentialité
        </Link>
        .
      </p>
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

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function SuccessOverlay({ statusText }: { statusText: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/85 backdrop-blur-md"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Onde circulaire */}
        <motion.span
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
        />

        {/* Eclats de particules */}
        {PARTICLE_ANGLES.map((angle, i) => (
          <motion.span
            key={angle}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * 46,
              y: Math.sin((angle * Math.PI) / 180) * 46,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.01, ease: "easeOut" }}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300"
            style={{ boxShadow: "0 0 6px 2px rgba(34,211,238,0.8)" }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.8)]"
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
      </div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-lg font-bold uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
      >
        Connexion réussie
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-white/70"
      >
        {statusText}
      </motion.p>
    </motion.div>
  );
}

const MODE_TITLES: Record<Mode, string> = {
  login: "Connexion — MargeMax",
  signup: "Créer un compte — MargeMax",
};

/**
 * Ne monte QUE la disposition utile (desktop OU mobile) : avant, les deux
 * formulaires desktop (masques en CSS) restaient montes sous le formulaire
 * mobile, soit 3 formulaires et des champs email/mot de passe dupliques --
 * ce qui embrouille l'AutoFill de Safari iOS (gel a l'ouverture du clavier).
 * Sans risque d'hydratation : ce composant est rendu cote client uniquement
 * (voir neon-auth-panel-client.tsx).
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export function NeonAuthPanel({ initialMode }: { initialMode: Mode }) {
  const isDesktop = useIsDesktop();

  // Mobile : quand le clavier s'ouvre, ramene le champ actif au centre de la
  // zone visible (iOS le laissait parfois derriere le clavier, ne montrant
  // que la barre de fleches).
  useEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const el = e.target as HTMLElement | null;
      if (!el || !/^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
      if (!window.matchMedia("(max-width: 767px)").matches) return;
      window.setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 350);
    }
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);
  const [mode, setMode] = useState<Mode>(initialMode);

  // Le bascule login/signup est un simple etat client (panneau glissant),
  // pas une navigation Next.js -- volontaire, pour ne jamais demonter le
  // formulaire en cours de saisie. Mais l'URL et le <title> affiches
  // restaient figes sur la route de depart, incoherents avec le
  // formulaire reellement visible. history.replaceState (pas
  // router.replace, qui remonterait le composant en changeant de route)
  // met a jour l'un et l'autre sans perturber l'etat du composant.
  useEffect(() => {
    document.title = MODE_TITLES[mode];
    const path = mode === "login" ? "/login" : "/signup";
    if (window.location.pathname !== path) {
      // "expired" n'a de sens que sur /login : ne pas le reporter sur /signup.
      const params = new URLSearchParams(window.location.search);
      params.delete("expired");
      const query = params.toString();
      window.history.replaceState(null, "", path + (query ? `?${query}` : ""));
    }
  }, [mode]);

  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const initialLoginState: AuthActionState =
    callbackError === "account_not_found"
      ? { error: ACCOUNT_NOT_FOUND_MESSAGE }
      : callbackError === "confirmation"
        ? { error: CALLBACK_ERROR_MESSAGE }
        : initialState;
  const [loginState, loginActionFn] = useFormState(login, initialLoginState);
  // Inscription par fetch vers /api/auth/signup (et non par Server Action +
  // useFormState) : le resultat arrive dans un etat React local. Avec la
  // Server Action, le formulaire etait reinitialise sans message et il fallait
  // le remplir 2-3 fois avant de voir l'ecran du code de verification.
  const [signupState, setSignupState] = useState<AuthActionState>(initialState);
  const [signupPending, setSignupPending] = useState(false);
  const submitSignup = async (formData: FormData) => {
    const email = String(formData.get("email") ?? "").trim();
    setSignupPending(true);
    setSignupState(initialState);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 40000);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: String(formData.get("password") ?? ""),
          confirmPassword: String(formData.get("confirmPassword") ?? ""),
          company: String(formData.get("company") ?? ""),
          remember: formData.get("remember") === "on",
        }),
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      if (!data || typeof data !== "object") throw new Error(`Réponse invalide (${res.status})`);
      setSignupState(data as AuthActionState);
    } catch (err) {
      // Pas de reponse (delai, coupure) : le code a tres probablement ete
      // envoye, on affiche donc directement la saisie du code.
      console.error("[auth] L'inscription n'a pas répondu :", err);
      setSignupState(
        email
          ? { message: SIGNUP_SLOW_NOTICE, pendingEmail: email }
          : { error: "Une erreur est survenue. Réessaie dans un instant." }
      );
    } finally {
      window.clearTimeout(timer);
      setSignupPending(false);
    }
  };
  const router = useRouter();

  const isSuccess = Boolean(loginState.success || signupState.success);
  const pendingPack = searchParams.get("pack");
  const [consentPack, setConsentPack] = useState<ConsentPack | null>(null);
  const [consentUserId, setConsentUserId] = useState<string | undefined>();

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(async () => {
      // Achat de pack demarre avant connexion (?pack=<cle>) : on reprend
      // exactement ce parcours au lieu d'atterrir sur /dashboard, avec
      // l'utilisateur maintenant connu pour lier le paiement au bon
      // compte (client_reference_id du Payment Link Stripe). Avant toute
      // redirection vers Stripe, la case "execution immediate +
      // renonciation retractation" (art. L.221-28) doit etre cochee.
      //
      // getUser() est dans un try/catch : sans lui, un blip reseau ici
      // laissait l'ecran "Redirection en cours..." affiche indefiniment
      // (aucune des deux branches -- ni ouverture du consentement, ni
      // redirection /dashboard -- n'etait jamais atteinte), forcant un
      // rechargement manuel de la page apres une connexion pourtant
      // reussie.
      if (pendingPack) {
        const pack = PACKS.find((p) => p.key === pendingPack);
        if (pack) {
          try {
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              setConsentUserId(user.id);
              setConsentPack({
                key: pack.key,
                label: pack.label,
                credits: pack.credits,
                priceEuros: pack.priceEuros,
              });
              return;
            }
          } catch (err) {
            console.error(
              "[NeonAuthPanel] Impossible de récupérer l'utilisateur après connexion -- redirection vers /dashboard sans reprise du pack :",
              err
            );
          }
        }
      }
      router.push("/dashboard");
      router.refresh();
    }, 1400);
    return () => clearTimeout(timer);
  }, [isSuccess, pendingPack, router]);

  function handleConsentCancel() {
    setConsentPack(null);
    setConsentUserId(undefined);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative w-full max-w-3xl">
      {/* Halo neon ambiant */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 hidden md:block rounded-[2rem] bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-pink-500/30 blur-3xl"
      />

      {/* Bordure neon degradee */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 p-[1.5px] shadow-[0_0_60px_-10px_rgba(217,70,239,0.5)]">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a14]">
          <div className="relative grid min-h-[560px] md:grid-cols-2">
            {/* Desktop : les deux formulaires sont toujours montes cote a
                cote, l'overlay glisse pour ne laisser voir que l'un des
                deux -- le formulaire masque par l'overlay est rendu
                "inert" (non focusable au clavier, ignore des lecteurs
                d'ecran) pour qu'aucun champ ni icone residuelle du
                formulaire cache ne reste accessible par Tab. */}
            {isDesktop && (
            <>
            <div
              className="hidden items-center justify-center p-8 sm:p-10 md:flex"
              aria-hidden={mode !== "login"}
              inert={mode !== "login" ? true : undefined}
            >
              <LoginForm action={loginActionFn} state={loginState} idPrefix="desktop" />
            </div>
            <div
              className="hidden items-center justify-center p-8 sm:p-10 md:flex"
              aria-hidden={mode !== "signup"}
              inert={mode !== "signup" ? true : undefined}
            >
              <SignupForm onSubmit={submitSignup} pending={signupPending} state={signupState} idPrefix="desktop" onSwitchToLogin={() => setMode("login")} />
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
                        text="Crée ton compte et reçois 3 crédits offerts pour analyser tes premiers produits."
                        cta="S'inscrire"
                        onClick={() => setMode("signup")}
                      />
                    ) : (
                      <OverlayFace
                        key="to-login"
                        title="Déjà un compte ?"
                        text="Connecte-toi pour retrouver ton carnet de sourcing et tes crédits."
                        cta="Se connecter"
                        onClick={() => setMode("login")}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            </>
            )}

            {/* Mobile : un seul formulaire visible a la fois + lien de
                bascule (pas d'overlay coulissant, non adapte au petit
                ecran). */}
            {!isDesktop && (
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
                    <SignupForm onSubmit={submitSignup} pending={signupPending} state={signupState} idPrefix="mobile" onSwitchToLogin={() => setMode("login")} />
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
            )}

            <AnimatePresence>
              {isSuccess && (
                <SuccessOverlay
                  statusText={
                    consentPack
                      ? "Finalisation de ta commande..."
                      : "Redirection en cours..."
                  }
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <CheckoutConsentDialog
        pack={consentPack}
        userId={consentUserId}
        onCancel={handleConsentCancel}
      />

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-white/50">
        <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
        Connexion sécurisée via Supabase
      </p>
    </div>
  );
}
