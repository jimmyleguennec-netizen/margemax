import { NextResponse } from "next/server";

import { getStripeClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cree une session du portail de facturation Stripe pour l'utilisateur
 * connecte (bouton "Gérer mes factures", onglet Mon compte). Le client
 * Stripe (`stripe_customer_id`) est enregistre par le webhook au premier
 * achat de credits reussi (voir app/api/webhooks/stripe/route.ts) --
 * jamais cree ici a la volee, ce endpoint est en lecture seule vis-a-vis
 * de Stripe.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connectez-vous pour accéder à vos factures." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[api/stripe/billing-portal] lecture profil échouée:", profileError);
    return NextResponse.json(
      { error: "Impossible de récupérer vos informations de facturation pour le moment." },
      { status: 502 }
    );
  }

  if (!profile?.stripe_customer_id) {
    // Cas normal pour tout compte qui n'a encore jamais achete de
    // credits -- Stripe ne cree un client que lors d'un premier paiement
    // reussi. Message honnete plutot qu'une erreur generique.
    return NextResponse.json(
      {
        error:
          "Aucun historique de facturation pour le moment. Il apparaîtra ici après votre premier achat de crédits.",
      },
      { status: 404 }
    );
  }

  const siteUrl = getSiteUrl();

  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/dashboard?tab=account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Cause la plus frequente : le portail client Stripe n'a jamais ete
    // configure cote Dashboard Stripe (Settings -> Billing -> Customer
    // portal) -- Stripe rejette alors la creation de session avec un
    // message explicite, journalise ici pour diagnostic.
    console.error("[api/stripe/billing-portal] échec création de session:", err);
    return NextResponse.json(
      {
        error:
          "Impossible d'ouvrir le portail de facturation pour le moment. Réessayez, ou contactez le support.",
      },
      { status: 502 }
    );
  }
}
