import { NextResponse } from "next/server";

import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Adresse de secours Resend : fonctionne sans verification DNS, reservee
// aux tests mais toujours acceptee par l'API -- utilisee par defaut ET en
// repli automatique si RESEND_FROM_EMAIL pointe vers un domaine non
// verifie (voir sendViaResend plus bas). Domaine "resend.dev" toujours
// disponible, jamais a configurer.
const RESEND_FALLBACK_FROM_EMAIL = "MargeMax <onboarding@resend.dev>";
// Doit etre une adresse d'un domaine verifie dans le compte Resend
// (Resend refuse d'envoyer "From" un domaine non verifie) -- si absente
// ou si l'envoi echoue specifiquement pour ce motif, repli automatique
// sur RESEND_FALLBACK_FROM_EMAIL plutot que de faire echouer tout le
// formulaire de contact a cause d'une configuration DNS incomplete.
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? RESEND_FALLBACK_FROM_EMAIL;
const CONTACT_DESTINATION_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@autoutilshop.fr";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Envoi direct du formulaire de contact (`/#contact`) par e-mail --
 * remplace l'ancien systeme `mailto:` cote client, qui necessitait que le
 * visiteur ait une application e-mail configuree sur son appareil pour
 * que le message parte reellement. Ici, l'envoi se fait cote serveur via
 * l'API REST de Resend (appel `fetch` direct, pas le SDK npm `resend` --
 * evite d'ajouter une dependance a package.json/package-lock.json dans un
 * environnement sans Node pour regenerer le lockfile correctement, meme
 * pattern que l'integration Firecrawl dans lib/aliexpress-search.ts).
 */
export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide — JSON attendu ({ name, email, message })." },
      { status: 400 }
    );
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name) {
    return NextResponse.json({ error: "Merci d'indiquer ton nom." }, { status: 400 });
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Merci d'indiquer une adresse e-mail valide." },
      { status: 400 }
    );
  }
  if (!message) {
    return NextResponse.json({ error: "Merci d'écrire un message." }, { status: 400 });
  }
  if (name.length > 100 || message.length > 5000) {
    return NextResponse.json(
      { error: "Ton message est trop long (5000 caractères maximum, 100 pour le nom)." },
      { status: 400 }
    );
  }

  const ipAllowed = await checkRateLimit(
    `contact:ip:${getClientIp()}`,
    RATE_LIMITS.contactByIp
  );
  if (!ipAllowed) {
    return NextResponse.json(
      { error: "Trop de messages envoyés récemment. Merci de réessayer dans quelques instants." },
      { status: 429 }
    );
  }

  if (!RESEND_API_KEY) {
    console.error(
      "[api/contact] RESEND_API_KEY absente — configure cette variable (Vercel -> Environment Variables) pour activer l'envoi réel."
    );
    return NextResponse.json(
      {
        error:
          "L'envoi de message n'est pas encore configuré. Merci de nous écrire directement à contact@autoutilshop.fr.",
      },
      { status: 502 }
    );
  }

  let result = await sendViaResend(RESEND_FROM_EMAIL, { name, email, message });

  // Repli automatique : si l'echec vient specifiquement d'un domaine
  // d'expediteur non verifie cote Resend (RESEND_FROM_EMAIL mal configure
  // en variable d'environnement, ex. un domaine autoutilshop.fr jamais
  // verifie dans le compte Resend), on retente une seule fois avec le
  // domaine de test toujours accepte -- plutot que de faire echouer tout
  // le formulaire de contact a cause d'une verification DNS incomplete.
  if (!result.ok && result.reason === "domain_not_verified" && RESEND_FROM_EMAIL !== RESEND_FALLBACK_FROM_EMAIL) {
    console.warn(
      `[api/contact] "${RESEND_FROM_EMAIL}" rejeté par Resend (domaine non vérifié) — nouvelle tentative avec l'adresse de secours ${RESEND_FALLBACK_FROM_EMAIL}.`
    );
    result = await sendViaResend(RESEND_FALLBACK_FROM_EMAIL, { name, email, message });
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          "Impossible d'envoyer ton message pour le moment. Réessaie, ou écris-nous directement à contact@autoutilshop.fr.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

type SendResult =
  | { ok: true }
  | { ok: false; reason: "domain_not_verified" | "resend_error" | "network_error" };

/**
 * Un seul appel a l'API Resend, avec des logs assez precis pour diagnostiquer
 * une panne depuis les logs Vercel sans avoir a reproduire le probleme :
 * distingue une erreur reseau (impossible de joindre Resend), une erreur
 * Resend generique (cle invalide, limite atteinte...) et le cas specifique
 * "domaine d'expediteur non verifie" (detecte dans le corps de reponse),
 * seul motif qui declenche le repli automatique ci-dessus.
 */
async function sendViaResend(
  fromEmail: string,
  { name, email, message }: { name: string; email: string; message: string }
): Promise<SendResult> {
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [CONTACT_DESTINATION_EMAIL],
        // reply_to l'adresse du visiteur : une reponse directe depuis la
        // boite mail atterrit chez lui, pas chez Resend.
        reply_to: email,
        subject: `Contact MargeMax : ${name}`,
        html: `<p><strong>Nom :</strong> ${escapeHtml(name)}</p><p><strong>Email :</strong> ${escapeHtml(email)}</p><p><strong>Message :</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
        text: `Nom : ${name}\nEmail : ${email}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    console.error(
      `[api/contact] Impossible de joindre l'API Resend (from="${fromEmail}") :`,
      err
    );
    return { ok: false, reason: "network_error" };
  }

  if (response.ok) {
    return { ok: true };
  }

  const rawBody = await response.text().catch(() => "");
  let parsedMessage = rawBody;
  try {
    const parsed = JSON.parse(rawBody) as { message?: string; name?: string };
    parsedMessage = parsed.message ?? rawBody;
  } catch {
    // Corps non-JSON (rare, ex. panne infra Resend) -- garde le texte brut.
  }

  console.error(
    `[api/contact] Resend a répondu avec une erreur (code ${response.status}, from="${fromEmail}") :`,
    parsedMessage
  );

  // Resend signale un domaine "From" non verifie via un message contenant
  // "domain" + "verif" (ex. "The autoutilshop.fr domain is not verified.
  // Please, add and verify your domain on resend.com/domains") -- pas de
  // code d'erreur machine-friendly stable documente pour ce cas precis,
  // donc detection textuelle deliberement large plutot qu'un match exact
  // fragile.
  const looksLikeUnverifiedDomain =
    response.status === 403 &&
    /domain/i.test(parsedMessage) &&
    /verif/i.test(parsedMessage);

  return { ok: false, reason: looksLikeUnverifiedDomain ? "domain_not_verified" : "resend_error" };
}
