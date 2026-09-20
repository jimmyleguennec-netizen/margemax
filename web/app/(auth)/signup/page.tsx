import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { NeonAuthPanelClient } from "@/components/auth/neon-auth-panel-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Créer un compte — MargeMax",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { pack?: string };
}) {
  // Voir app/(auth)/login/page.tsx : meme garde et meme isolation d'erreur.
  let isLoggedIn = false;
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    isLoggedIn = Boolean(user);
  } catch (err) {
    console.error("[signup] Vérification de session impossible :", err);
  }

  if (isLoggedIn) {
    redirect(
      searchParams.pack
        ? `/dashboard?pack=${encodeURIComponent(searchParams.pack)}`
        : "/dashboard"
    );
  }

  return <NeonAuthPanelClient initialMode="signup" />;
}
