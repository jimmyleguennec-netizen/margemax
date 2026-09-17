"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import { RgbLoader } from "@/components/ui/rgb-loader";

const OAUTH_ERROR_MESSAGE =
  "Connexion impossible pour le moment. Réessaie ou utilise ton e-mail.";

/**
 * Desactive temporairement le bouton Apple tant que le provider Apple
 * n'est pas confirme configure cote Supabase (Authentication ->
 * Providers) -- evite de presenter comme fonctionnel un bouton qui ne
 * peut pas aboutir. Remettre a `true` une fois le provider active et
 * verifie.
 */
const APPLE_OAUTH_ENABLED = false;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.39-3.104c.843-1.025 1.415-2.454 1.259-3.883-1.22.052-2.7.818-3.573 1.845-.78.907-1.462 2.36-1.28 3.752 1.36.104 2.75-.688 3.594-1.714z" />
    </svg>
  );
}

/**
 * Etat partage Google/Apple : gere le loader, l'erreur, la protection
 * anti-double-clic et surtout la restauration Safari depuis le
 * bfcache -- quand l'utilisateur revient en arriere apres avoir quitte
 * la page pour l'ecran d'authentification du provider, Safari peut
 * restaurer la page EXACTEMENT dans l'etat ou elle etait (bouton
 * "clicked=true", loader fige) sans jamais relancer notre code. Sans
 * l'ecouteur pageshow ci-dessous, le bouton resterait bloque en
 * chargement indefiniment -- c'est le symptome exact signale.
 */
function useOAuthSignIn(provider: "google" | "apple") {
  const [clicked, setClicked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setClicked(false);
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  async function signIn() {
    if (clicked) return;
    setClicked(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) {
        // Erreur retournee explicitement par Supabase (provider desactive,
        // config manquante...) -- distincte d'une exception reseau.
        console.error(`[oauth] ${provider} a renvoye une erreur :`, oauthError);
        setError(OAUTH_ERROR_MESSAGE);
        setClicked(false);
        return;
      }
      // Succes : Supabase declenche deja la redirection navigateur -- on
      // laisse le loader tourner jusqu'a la navigation, pas de reset ici.
    } catch (err) {
      // Exception reseau (domaine Supabase injoignable, DNS, etc.) plutot
      // qu'un refus applicatif -- logguee separement pour le diagnostic.
      console.error(`[oauth] Exception reseau pendant la connexion ${provider} :`, err);
      setError(OAUTH_ERROR_MESSAGE);
      setClicked(false);
    }
  }

  return { clicked, error, signIn };
}

function GoogleButton() {
  const { clicked, error, signIn } = useOAuthSignIn("google");

  return (
    <div>
      <motion.button
        type="button"
        onClick={signIn}
        disabled={clicked}
        whileHover={
          !clicked
            ? {
                scale: 1.03,
                boxShadow:
                  "0 0 24px -4px rgba(66,133,244,0.6), 0 0 24px -4px rgba(52,168,83,0.4), 0 0 24px -4px rgba(251,188,5,0.4)",
              }
            : undefined
        }
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {clicked ? (
          <RgbLoader size={16} />
        ) : (
          <motion.span
            animate={clicked ? { rotateY: 180 } : { rotateY: 0 }}
            transition={{ duration: 0.5 }}
            className="flex"
          >
            <GoogleIcon className="h-4 w-4" />
          </motion.span>
        )}
        Continuer avec Google
      </motion.button>
      {error && <p className="mt-1.5 text-center text-xs text-pink-300">{error}</p>}
    </div>
  );
}

function AppleButton() {
  const { clicked, error, signIn } = useOAuthSignIn("apple");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.15);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  if (!APPLE_OAUTH_ENABLED) {
    return (
      <div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="relative flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/40"
        >
          <AppleIcon className="h-4 w-4" />
          Continuer avec Apple
          <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/30">
            Bientôt
          </span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <motion.button
        type="button"
        onClick={signIn}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        disabled={clicked}
        style={{ x: springX, y: springY }}
        whileHover={
          !clicked
            ? {
                boxShadow:
                  "0 0 20px -2px rgba(255,255,255,0.35), inset 0 0 12px rgba(255,255,255,0.08)",
              }
            : undefined
        }
        animate={clicked ? { scale: [1, 0.94, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.02] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {clicked ? <RgbLoader size={16} /> : <AppleIcon className="h-4 w-4" />}
        Continuer avec Apple
      </motion.button>
      {error && <p className="mt-1.5 text-center text-xs text-pink-300">{error}</p>}
    </div>
  );
}

export function OAuthButtons() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-wider text-white/30">
          ou continuer avec
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <GoogleButton />
      <AppleButton />
    </div>
  );
}
