import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { NeonAuthPanel } from "@/components/auth/neon-auth-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Créer un compte — MargeMax",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { pack?: string };
}) {
  // Voir app/(auth)/login/page.tsx : meme garde, un utilisateur deja
  // connecte n'a rien a faire sur le formulaire d'inscription.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(searchParams.pack ? `/dashboard?pack=${searchParams.pack}` : "/dashboard");
  }

  return <NeonAuthPanel initialMode="signup" />;
}
