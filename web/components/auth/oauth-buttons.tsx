"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import { RgbLoader } from "@/components/ui/rgb-loader";

const OAUTH_ERROR_MESSAGE =
  "Connexion impossible pour le moment. Réessaie ou utilise ton e-mail.";

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

/**
 * Gere le loader, l'erreur, la protection anti-double-clic et surtout
 * la restauration Safari depuis le bfcache -- quand l'utilisateur
 * revient en arriere apres avoir quitte la page pour l'ecran
 * d'authentification Google, Safari peut restaurer la page EXACTEMENT
 * dans l'etat ou elle etait (bouton "clicked=true", loader fige) sans
 * jamais relancer notre code. Sans l'ecouteur pageshow ci-dessous, le
 * bouton resterait bloque en chargement indefiniment -- c'est le
 * symptome exact signale.
 */
function useGoogleSignIn() {
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
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) {
        // Erreur retournee explicitement par Supabase (provider desactive,
        // config manquante...) -- distincte d'une exception reseau.
        console.error("[oauth] google a renvoye une erreur :", oauthError);
        setError(OAUTH_ERROR_MESSAGE);
        setClicked(false);
        return;
      }
      // Succes : Supabase declenche deja la redirection navigateur -- on
      // laisse le loader tourner jusqu'a la navigation, pas de reset ici.
    } catch (err) {
      // Exception reseau (domaine Supabase injoignable, DNS, etc.) plutot
      // qu'un refus applicatif -- logguee separement pour le diagnostic.
      console.error("[oauth] Exception reseau pendant la connexion google :", err);
      setError(OAUTH_ERROR_MESSAGE);
      setClicked(false);
    }
  }

  return { clicked, error, signIn };
}

function GoogleButton() {
  const { clicked, error, signIn } = useGoogleSignIn();

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
    </div>
  );
}
