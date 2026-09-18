import { NextResponse } from "next/server";

import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Doit etre une adresse d'un domaine verifie dans le compte Resend
// (Resend refuse d'envoyer "From" un domaine non verifie) -- repli sur le
// domaine de test onboarding@resend.dev, qui fonctionne sans verification
// mais n'est destine qu'a valider que l'envoi marche, pas a un usage en
// production durable.
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "MargeMax <onboarding@resend.dev>";
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
    return NextResponse.json({ error: "Merci d'indiquer votre nom." }, { status: 400 });
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
      "[api/contact] RESEND_API_KEY absente — configurez cette variable (Vercel -> Environment Variables) pour activer l'envoi réel."
    );
    return NextResponse.json(
      {
        error:
          "L'envoi de message n'est pas encore configuré. Merci de nous écrire directement à contact@autoutilshop.fr.",
      },
      { status: 502 }
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
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

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        `[api/contact] Resend a répondu avec une erreur (code ${response.status}) :`,
        errorBody
      );
      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer votre message pour le moment. Réessayez, ou écrivez-nous directement à contact@autoutilshop.fr.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact] Exception pendant l'envoi via Resend :", err);
    return NextResponse.json(
      {
        error:
          "Impossible de contacter le service d'envoi pour le moment. Réessayez dans quelques instants.",
      },
      { status: 502 }
    );
  }
}
