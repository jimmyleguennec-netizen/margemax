import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { NeonAuthPanelClient } from "@/components/auth/neon-auth-panel-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion — MargeMax",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { pack?: string };
}) {
  // Un utilisateur deja connecte ne doit jamais revoir le formulaire de
  // connexion -- renvoie vers l'outil en conservant un pack en attente.
  // getUser() est isole dans un try/catch : une panne Supabase ne doit
  // jamais faire echouer (page blanche) l'ecran de connexion lui-meme.
  // redirect() reste HORS du try (il fonctionne en levant une exception).
  let isLoggedIn = false;
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    isLoggedIn = Boolean(user);
  } catch (err) {
    console.error("[login] Vérification de session impossible :", err);
  }

  if (isLoggedIn) {
    redirect(
      searchParams.pack
        ? `/dashboard?pack=${encodeURIComponent(searchParams.pack)}`
        : "/dashboard"
    );
  }

  return <NeonAuthPanelClient initialMode="login" />;
}
