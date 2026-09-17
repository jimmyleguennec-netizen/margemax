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
      // Erreur retournee explicitement par Supabase (identifiants
      // invalides) -- distincte d'une exception reseau ci-dessous.
      return { error: "Email ou mot de passe incorrect." };
    }

    // Pas de redirect() ici : le client affiche une animation de succès
    // puis navigue lui-même vers /dashboard une fois celle-ci jouee.
    return { success: true };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    console.error("[auth] Exception reseau pendant la connexion :", err);
    // Panne d'infrastructure (variables manquantes, Supabase injoignable...)
    // On l'affiche clairement au lieu de rediriger silencieusement vers un
    // tableau de bord de demonstration : un echec de connexion ne doit
    // jamais donner l'impression d'avoir reussi.
    return {
      error: "Connexion impossible pour le moment. Réessaie dans quelques instants.",
    };
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
    console.error("[auth] Exception reseau pendant l'inscription :", err);
    return {
      error: "Inscription impossible pour le moment. Réessaie dans quelques instants.",
    };
  }
}

/**
 * Toujours le meme message de succes, que l'email existe ou non en base --
 * ne jamais reveler si une adresse est inscrite (enumeration de comptes).
 */
const RESET_REQUEST_MESSAGE =
  "Si un compte existe pour cette adresse, un e-mail de récupération vient d'être envoyé.";

export async function requestPasswordReset(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Merci de renseigner ton adresse e-mail." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error(
      "[auth] NEXT_PUBLIC_SITE_URL manquante -- impossible de construire une redirection de récupération sûre."
    );
    return {
      error: "Récupération impossible pour le moment. Réessaie dans quelques instants.",
    };
  }

  try {
    const supabase = createClient();
    // Passe par /auth/callback (deja responsable de l'echange PKCE du code
    // contre une session, cookies inclus) plutot que de rediriger
    // directement vers /reset-password sans session etablie.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });

    if (error) {
      console.error("[auth] resetPasswordForEmail a renvoyé une erreur :", error);
      // Meme message que le succes : ne pas confirmer/infirmer l'existence
      // du compte cote client.
      return { message: RESET_REQUEST_MESSAGE };
    }

    return { message: RESET_REQUEST_MESSAGE };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    console.error("[auth] Exception reseau pendant la demande de récupération :", err);
    return {
      error: "Récupération impossible pour le moment. Réessaie dans quelques instants.",
    };
  }
}

export async function updatePassword(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  try {
    const supabase = createClient();

    // updateUser exige une session active : sans lien de recuperation
    // valide/recent (deja echange par /auth/callback), aucune session
    // n'existe ici et Supabase renvoie une erreur -- distincte d'un lien
    // simplement expire, mais traitee avec le meme message clair.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        error:
          "Ce lien de récupération est invalide ou a expiré. Refais une demande.",
      };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("[auth] updateUser a renvoyé une erreur :", error);
      return {
        error:
          "Impossible de définir ce mot de passe pour le moment. Réessaie.",
      };
    }

    return { success: true };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    console.error("[auth] Exception reseau pendant la mise à jour du mot de passe :", err);
    return {
      error: "Impossible de définir ce mot de passe pour le moment. Réessaie.",
    };
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
