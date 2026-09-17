"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

/**
 * Etat de session cote client, pour les composants publics (Landing
 * Page) qui doivent adapter un lien d'action (ex. "Choisir ce pack")
 * selon que le visiteur est deja connecte ou non -- sans passer par un
 * Server Component. `loading` reste vrai le temps du premier appel
 * reseau : les appelants doivent eviter d'exposer un lien Stripe avant
 * de savoir si un utilisateur est reellement connu.
 */
export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
