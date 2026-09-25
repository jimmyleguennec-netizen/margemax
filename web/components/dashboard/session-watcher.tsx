"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const EXPIRED_URL = "/login?expired=true";

/**
 * Ecoute la session cote navigateur pendant qu'un utilisateur est sur le
 * dashboard : si elle prend fin (SIGNED_OUT, dont l'echec definitif d'un
 * rafraichissement de jeton) ou est trouvee invalide au retour sur
 * l'onglet, renvoie vers /login avec le message d'expiration. Le middleware
 * ne protege que les navigations : un onglet laisse ouvert doit reagir
 * lui-meme.
 */
export function SessionWatcher() {
  const router = useRouter();

  useEffect(() => {
    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      console.error("[SessionWatcher] Client Supabase indisponible :", err);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace(EXPIRED_URL);
    });

    async function recheck() {
      if (document.visibilityState !== "visible") return;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!data.user && error) router.replace(EXPIRED_URL);
      } catch (err) {
        // Panne reseau : ne deconnecte pas, on reverifiera au prochain retour.
        console.error("[SessionWatcher] Verification de session impossible :", err);
      }
    }

    document.addEventListener("visibilitychange", recheck);
    return () => {
      document.removeEventListener("visibilitychange", recheck);
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
