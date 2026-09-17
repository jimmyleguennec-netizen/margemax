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
    let active = true;

    // Ce hook est monte sans interaction utilisateur sur des sections
    // publiques (Pricing, CreditCalculator) : createClient() peut lever
    // une exception synchrone si la config Supabase est absente. Sans ce
    // try/catch, ça ferait planter toute la Landing Page pour un visiteur
    // meme pas connecte -- on degrade plutot vers "non connecte".
    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      console.error("[useSupabaseUser] Client Supabase indisponible :", err);
      setLoading(false);
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[useSupabaseUser] Échec de getUser() :", err);
        if (!active) return;
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
