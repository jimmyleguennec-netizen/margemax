import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { pack?: string };
}) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect(searchParams.pack ? `/login?pack=${searchParams.pack}` : "/login");
    }

    // Solde de credits reel (table public.profiles, voir schema_margemax.sql
    // -- credits/credits_gauge_max, RLS "select using (auth.uid() = id)").
    // Si la table/colonne n'existe pas encore sur le projet Supabase
    // connecte, on affiche simplement "--" plutot que de planter la page.
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits, credits_gauge_max")
      .eq("id", user.id)
      .maybeSingle();

    // Historique d'achats reel (table public.credit_purchases, remplie
    // uniquement par le webhook Stripe apres paiement confirme -- voir
    // schema_margemax.sql et app/api/webhooks/stripe/route.ts). Jamais
    // un achat simule : une ligne ici correspond a un paiement reellement
    // traite.
    const { data: purchaseRows } = await supabase
      .from("credit_purchases")
      .select("id, pack_key, credits, amount_total, currency, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return (
      <DashboardShell
        userId={user.id}
        email={user.email ?? ""}
        credits={profile?.credits ?? null}
        creditsMax={profile?.credits_gauge_max ?? null}
        purchases={purchaseRows ?? []}
        pendingPackKey={searchParams.pack ?? null}
      />
    );
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
