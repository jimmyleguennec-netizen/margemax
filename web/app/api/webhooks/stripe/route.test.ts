import { beforeEach, describe, expect, it, vi } from "vitest";

// Etat partage entre les mocks et les assertions -- reinitialise avant
// chaque test (voir beforeEach). N'imite PAS une vraie base : simule
// uniquement les reponses que Postgres/Supabase renverraient (notamment
// le code d'erreur 23505 = violation de contrainte unique), pour tester
// la LOGIQUE d'idempotence de la route elle-meme, pas Postgres.
const insertCalls: { table: string; row: unknown }[] = [];
const rpcCalls: { name: string; params: unknown }[] = [];
let webhookEventShouldConflict = false;
let creditPurchaseShouldConflict = false;

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from(table: string) {
      return {
        insert: async (row: unknown) => {
          insertCalls.push({ table, row });
          if (table === "stripe_webhook_events" && webhookEventShouldConflict) {
            return { error: { code: "23505", message: "duplicate event" } };
          }
          if (table === "credit_purchases" && creditPurchaseShouldConflict) {
            return { error: { code: "23505", message: "duplicate session" } };
          }
          return { error: null };
        },
        update: () => ({
          eq: async () => ({ error: null }),
        }),
      };
    },
    rpc: async (name: string, params: unknown) => {
      rpcCalls.push({ name, params });
      return { error: null };
    },
  }),
}));

vi.mock("@/lib/stripe", () => ({
  // Signature Stripe non re-verifiee ici (SDK tiers, deja teste par
  // Stripe lui-meme) : ce test couvre la logique metier de la route
  // APRES verification de signature -- idempotence et validation de
  // montant, pas le SDK.
  getStripeClient: () => ({
    webhooks: {
      constructEvent: (rawBody: string) => JSON.parse(rawBody),
    },
  }),
}));

import { POST } from "./route";

const STARTER_USER_ID = "11111111-1111-1111-1111-111111111111";

function buildStarterEvent(overrides: {
  eventId?: string;
  sessionId?: string;
  amountTotal?: number;
}): unknown {
  return {
    id: overrides.eventId ?? "evt_test_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: overrides.sessionId ?? "cs_test_1",
        client_reference_id: `starter:${STARTER_USER_ID}`,
        payment_status: "paid",
        // Pack Starter = 2,99 € = 299 centimes (voir lib/packs.ts).
        amount_total: overrides.amountTotal ?? 299,
        currency: "eur",
        customer: null,
      },
    },
  };
}

async function postWebhook(event: unknown) {
  const request = new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "fake-signature" },
    body: JSON.stringify(event),
  });
  return POST(request);
}

describe("POST /api/webhooks/stripe — idempotence & validation de montant", () => {
  beforeEach(() => {
    insertCalls.length = 0;
    rpcCalls.length = 0;
    webhookEventShouldConflict = false;
    creditPurchaseShouldConflict = false;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("crédite les crédits pour un paiement confirmé conforme au pack déclaré", async () => {
    const response = await postWebhook(buildStarterEvent({}));
    expect(response.status).toBe(200);

    const addCredits = rpcCalls.filter((c) => c.name === "add_credits");
    expect(addCredits).toHaveLength(1);
    expect(addCredits[0].params).toMatchObject({
      p_user_id: STARTER_USER_ID,
      p_amount: 5, // Starter = 5 crédits.
    });
  });

  it("un même événement Stripe reçu deux fois ne crédite qu'une seule fois (idempotence event.id)", async () => {
    const event = buildStarterEvent({ eventId: "evt_repeated" });

    const first = await postWebhook(event);
    expect(first.status).toBe(200);
    expect(rpcCalls.filter((c) => c.name === "add_credits")).toHaveLength(1);

    // Stripe renvoie parfois le même événement plusieurs fois (retry sur
    // timeout/erreur réseau précédente) -- simule ce deuxième envoi en
    // faisant échouer l'insertion stripe_webhook_events comme le ferait
    // vraiment la contrainte unique sur event.id.
    webhookEventShouldConflict = true;
    const second = await postWebhook(event);
    const secondBody = await second.json();
    expect(secondBody.duplicate).toBe(true);

    // Aucun débit supplémentaire : toujours un seul appel add_credits au total.
    expect(rpcCalls.filter((c) => c.name === "add_credits")).toHaveLength(1);
  });

  it("une session Stripe déjà créditée (contrainte credit_purchases) n'est jamais recréditée", async () => {
    creditPurchaseShouldConflict = true;
    const response = await postWebhook(buildStarterEvent({ eventId: "evt_new_but_session_seen" }));
    expect(response.status).toBe(200);

    // credit_purchases a bien été tenté, mais la contrainte unique a
    // bloqué avant tout appel à add_credits.
    expect(insertCalls.some((c) => c.table === "credit_purchases")).toBe(true);
    expect(rpcCalls.filter((c) => c.name === "add_credits")).toHaveLength(0);
  });

  it("bloque le crédit si le montant encaissé ne correspond pas au prix réel du pack déclaré", async () => {
    // 1,00 € encaissé alors que le pack déclaré (starter) coûte 2,99 € --
    // scenario d'attaque documenté dans route.ts (URL de Payment Link
    // modifiée pour declarer un pack plus cher que celui reellement payé).
    await postWebhook(buildStarterEvent({ amountTotal: 100 }));

    expect(rpcCalls.filter((c) => c.name === "add_credits")).toHaveLength(0);
  });

  it("accepte un écart d'arrondi Stripe minime (±2 centimes) sans bloquer le crédit légitime", async () => {
    await postWebhook(buildStarterEvent({ amountTotal: 298 })); // 299 - 1

    expect(rpcCalls.filter((c) => c.name === "add_credits")).toHaveLength(1);
  });
});
