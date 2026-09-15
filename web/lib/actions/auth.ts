"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  message?: string;
  success?: boolean;
};

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function login(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Merci de renseigner votre email et votre mot de passe." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: "Email ou mot de passe incorrect." };
    }

    // Pas de redirect() ici : le client affiche une animation de succès
    // puis navigue lui-même vers /dashboard une fois celle-ci jouee.
    return { success: true };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    console.error("[auth] Supabase indisponible pendant la connexion :", err);
    // Panne d'infrastructure (variables manquantes, Supabase injoignable...)
    // plutot qu'un identifiant invalide : on ne casse pas l'interface avec
    // une page d'erreur 500, on renvoie vers /dashboard qui affichera son
    // propre repli de demonstration.
    redirect("/dashboard");
  }
}

export async function signup(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData);
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "Merci de renseigner votre email et votre mot de passe." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Si la confirmation par email est activée côté Supabase, aucune session
    // n'est ouverte immédiatement : on prévient l'utilisateur au lieu de
    // rediriger vers une zone protégée sans session.
    if (data.user && !data.session) {
      return {
        message:
          "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
      };
    }

    return { success: true };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    console.error("[auth] Supabase indisponible pendant l'inscription :", err);
    redirect("/dashboard");
  }
}

export async function logout() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    console.error("[auth] Erreur pendant la déconnexion :", err);
  }
  redirect("/login");
}
