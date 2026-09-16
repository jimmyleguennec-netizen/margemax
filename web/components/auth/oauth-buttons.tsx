"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import { RgbLoader } from "@/components/ui/rgb-loader";

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
      <path d="M16.365 1.43c0 1.14-.468 2.207-1.229 2.997-.813.844-2.13 1.503-3.22 1.415-.137-1.08.42-2.22 1.19-2.99.836-.86 2.28-1.51 3.26-1.422zM20.7 17.14c-.59 1.36-.87 1.96-1.63 3.17-1.06 1.68-2.55 3.78-4.4 3.79-1.64.02-2.06-1.07-4.28-1.06-2.22.01-2.68 1.08-4.32 1.06-1.85-.02-3.26-1.9-4.32-3.58-2.96-4.65-3.27-10.1-1.44-13-1.3-2.24.04-4.23.87-5.03.8-.78 1.94-1.34 3.03-1.34 1.17 0 1.9.64 2.87.64.94 0 1.5-.64 2.87-.64.96 0 2.02.53 2.85 1.44a3.9 3.9 0 0 0-2.1 3.44c.02 2.42 2.13 3.24 2.15 3.25-.02.06-.34 1.16-1.13 2.29z" />
    </svg>
  );
}

function GoogleButton() {
  const [clicked, setClicked] = useState(false);

  async function handleClick() {
    if (clicked) return;
    setClicked(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
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
  );
}

function AppleButton() {
  const [clicked, setClicked] = useState(false);
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

  async function handleClick() {
    if (clicked) return;
    setClicked(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
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
  );
}

export function OAuthButtons() {
  return (
    <div className="space-y-2.5">
      <GoogleButton />
      <AppleButton />
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-wider text-white/30">ou</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}
