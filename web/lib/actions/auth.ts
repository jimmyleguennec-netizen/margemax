"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  RATE_LIMITS,
  RATE_LIMIT_MESSAGE,
  checkRateLimit,
  getClientIp,
  resetRateLimit,
} from "@/lib/rate-limit";

export type AuthActionState = {
  error?: string;
  message?: string;
  success?: boolean;
  /** Email en attente de confirmation par code OTP (voir signup ci-dessous). */
  pendingEmail?: string;
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

/** Case a cocher HTML native, sans `value` explicite : "on" quand cochee,
 * absente du FormData quand decochee. */
function readRememberMe(formData: FormData): boolean {
  return formData.get("remember") === "on";
}

export async function login(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData);
  const rememberMe = readRememberMe(formData);

  if (!email || !password) {
    return { error: "Merci de renseigner ton email et ton mot de passe." };
  }

  const emailKey = `login:email:${email.toLowerCase()}`;
  const ipKey = `login:ip:${getClientIp()}`;
  const [ipAllowed, emailAllowed] = await Promise.all([
    checkRateLimit(ipKey, RATE_LIMITS.loginByIp),
    checkRateLimit(emailKey, RATE_LIMITS.loginByEmail),
  ]);
  if (!ipAllowed || !emailAllowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    const supabase = createClient({ rememberMe });
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Erreur retournee explicitement par Supabase (identifiants
      // invalides) -- distincte d'une exception reseau ci-dessous. Meme
      // message generique que le mot de passe ou l'email soit en cause :
      // ne jamais reveler si un compte existe pour cette adresse.
      return { error: "Email ou mot de passe incorrect." };
    }

    // Connexion reussie : la tentative echouee juste avant (mot de passe
    // mal saisi une premiere fois, par ex.) ne doit pas continuer a
    // compter contre ce compte.
    await resetRateLimit(emailKey);

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
  // Facultatif -- "Entreprise" du formulaire d'inscription, jamais requis
  // pour creer un compte. Non persiste dans public.profiles (aucune
  // colonne pour ca a ce jour, et une migration a executer manuellement
  // ne doit jamais etre un prealable silencieux a l'inscription) : stocke
  // uniquement dans les metadonnees Supabase (raw_user_meta_data),
  // recuperable plus tard sans perte si une colonne dediee est ajoutee.
  const company = String(formData.get("company") ?? "").trim();

  if (!email || !password) {
    return { error: "Merci de renseigner ton email et ton mot de passe." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const ipKey = `signup:ip:${getClientIp()}`;
  const emailKey = `signup:email:${email.toLowerCase()}`;
  const [ipAllowed, emailAllowed] = await Promise.all([
    checkRateLimit(ipKey, RATE_LIMITS.signupByIp),
    checkRateLimit(emailKey, RATE_LIMITS.signupByEmail),
  ]);
  if (!ipAllowed || !emailAllowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
        ...(company ? { data: { company_name: company } } : {}),
      },
    });

    // Bascule vers la saisie du code OTP dans tous les cas ou Supabase ne
    // renvoie pas de session immediate -- y compris une erreur "User
    // already registered" ou un rate limit ("delai d'attente") renvoyes
    // PAR signUp() lui-meme. C'est deliberement une protection anti-
    // enumeration : ne jamais reveler via l'interface si l'adresse
    // existait deja. Seules les validations faites AVANT l'appel a
    // signUp() ci-dessus (champs manquants, mot de passe trop court, mots
    // de passe qui ne correspondent pas) renvoient encore une erreur
    // directe, puisqu'elles ne dependent d'aucune information sur le
    // compte cote serveur.
    if (error) {
      console.error("[auth] signUp a renvoyé une erreur :", error);
      return {
        message: "Compte créé ! Un code de confirmation t'a été envoyé par e-mail.",
        pendingEmail: email,
      };
    }

    // Si la confirmation par email est activée côté Supabase, aucune session
    // n'est ouverte immédiatement : meme bascule vers l'OTP.
    if (data.user && !data.session) {
      return {
        message: "Compte créé ! Un code de confirmation t'a été envoyé par e-mail.",
        pendingEmail: email,
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

  const siteUrl = getSiteUrl();

  // Limite meme sur ce parcours "sans risque de mot de passe" : sans elle,
  // ce formulaire devient un moyen gratuit de spammer la boite mail d'une
  // victime avec des e-mails de reinitialisation.
  const ipKey = `password-reset:ip:${getClientIp()}`;
  const emailKey = `password-reset:email:${email.toLowerCase()}`;
  const [ipAllowed, emailAllowed] = await Promise.all([
    checkRateLimit(ipKey, RATE_LIMITS.passwordResetByIp),
    checkRateLimit(emailKey, RATE_LIMITS.passwordResetByEmail),
  ]);
  if (!ipAllowed || !emailAllowed) {
    // Meme message generique que le succes : ce n'est pas parce que la
    // limite est atteinte qu'il faut reveler l'existence du compte.
    return { message: RESET_REQUEST_MESSAGE };
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
          "Ce lien de récupération est invalide ou a expiré. Refaites une demande.",
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
