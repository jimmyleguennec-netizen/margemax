import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export default async function DashboardPage() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect("/login");
    }

    return <DashboardShell email={user.email ?? ""} />;
  } catch (err) {
    // redirect() ci-dessus fonctionne en lancant une exception interne
    // Next.js -- il ne faut surtout pas l'intercepter comme une vraie
    // erreur, sinon "non connecte" afficherait le dashboard de demo au
    // lieu de renvoyer vers /login.
    if (isNextRedirectError(err)) throw err;

    console.error(
      "[dashboard] Supabase indisponible ou variables d'environnement manquantes -- affichage du dashboard de demonstration :",
      err
    );
    return <DashboardShell email="demo@margemax.app" isDemo />;
  }
}
