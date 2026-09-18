import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HISTORY_LIMIT = 50;

/**
 * Historique des analyses AliExpress liées au compte connecté (voir
 * app/api/analyze/route.ts pour l'écriture). Se dégrade proprement si la
 * migration migration_search_history_details.sql n'a pas encore été
 * exécutée dans Supabase (colonnes absentes -> erreur Postgres 42703
 * "undefined_column") : renvoie une liste vide avec
 * migrationApplied: false plutôt qu'une erreur 500, pour que le tableau
 * de bord affiche clairement "historique non persisté" plutôt que de
 * planter (voir components/dashboard/history-panel.tsx).
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connectez-vous pour accéder à votre historique." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("search_history")
    .select(
      "id, query, title, product_url, total, partial_total, is_complete, currency, created_at"
    )
    .eq("user_id", user.id)
    .eq("status", "succes")
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) {
    const migrationLikelyMissing = error.code === "42703";
    if (!migrationLikelyMissing) {
      console.error("[api/history] échec de lecture:", error);
    }
    return NextResponse.json({ entries: [], migrationApplied: false });
  }

  return NextResponse.json({
    entries: (data ?? []).map((row) => ({
      id: `db-${row.id}`,
      query: row.query,
      title: row.title ?? row.query,
      url: row.product_url ?? "",
      total: row.total,
      partialTotal: row.partial_total,
      isComplete: row.is_complete,
      currency: row.currency ?? "EUR",
      timestamp: new Date(row.created_at).getTime(),
    })),
    migrationApplied: true,
  });
}
