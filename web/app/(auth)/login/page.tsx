import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { NeonAuthPanel } from "@/components/auth/neon-auth-panel";

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
  // connexion (bug confirme : /login restait affiche apres connexion) --
  // renvoie vers l'outil, en conservant un pack en attente pour que
  // DashboardShell reprenne le parcours d'achat (voir app/dashboard/page.tsx).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(searchParams.pack ? `/dashboard?pack=${searchParams.pack}` : "/dashboard");
  }

  return <NeonAuthPanel initialMode="login" />;
}
