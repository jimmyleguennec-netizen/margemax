import { NextResponse } from "next/server";

import { signup } from "@/lib/actions/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// L'envoi de l'e-mail de confirmation par Supabase peut etre lent.
export const maxDuration = 60;

/**
 * Inscription appelee en fetch par le formulaire /signup (a la place d'une
 * Server Action via useFormState) : le resultat arrive dans un simple
 * etat React local, sans re-rendu de route ni reinitialisation du
 * formulaire -- symptome constate avec la Server Action : formulaire vide
 * sans message, a refaire 2-3 fois avant d'obtenir l'ecran du code.
 * Reutilise exactement la logique de signup() (validations, limites de
 * debit, gestion des erreurs Supabase).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const formData = new FormData();
  for (const key of ["email", "password", "confirmPassword", "company"]) {
    formData.set(key, typeof body[key] === "string" ? (body[key] as string) : "");
  }
  if (body.remember === true) formData.set("remember", "on");

  try {
    const state = await signup(undefined, formData);
    return NextResponse.json(state);
  } catch (err) {
    console.error("[api-auth-signup] Échec inattendu de l'inscription :", err);
    return NextResponse.json(
      { error: "Inscription impossible pour le moment. Réessaie dans quelques instants." },
      { status: 500 }
    );
  }
}
