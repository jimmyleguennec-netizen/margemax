import { describe, expect, it } from "vitest";

import { PACKS } from "@/lib/packs";
import {
  buildCheckoutSessionParams,
  isPriceIdUsable,
  priceIdEnvName,
} from "@/lib/stripe-checkout";

describe("buildCheckoutSessionParams", () => {
  it("encode pack et utilisateur, montant en centimes exact pour chaque pack", () => {
    for (const pack of PACKS) {
      const params = buildCheckoutSessionParams(pack, "user-1", "https://margemax.com");
      expect(params.client_reference_id).toBe(`${pack.key}:user-1`);
      expect(params.mode).toBe("payment");
      const item = params.line_items?.[0] as { price_data: { unit_amount: number; currency: string } };
      expect(item.price_data.currency).toBe("eur");
      expect(item.price_data.unit_amount).toBe(Math.round(pack.priceEuros * 100));
    }
  });

  it("2,99 € -> 299 centimes (pas d'erreur de flottant)", () => {
    const starter = PACKS.find((p) => p.key === "starter")!;
    const params = buildCheckoutSessionParams(starter, "u", "https://margemax.com");
    const item = params.line_items?.[0] as { price_data: { unit_amount: number } };
    expect(item.price_data.unit_amount).toBe(299);
  });

  it("URLs de retour sur le site fourni et email prérempli si connu", () => {
    const params = buildCheckoutSessionParams(PACKS[0], "u", "https://margemax.com", "a@b.fr");
    expect(params.success_url).toBe("https://margemax.com/dashboard?tab=account&purchase=success");
    expect(params.cancel_url).toContain("https://margemax.com/dashboard");
    expect(params.customer_email).toBe("a@b.fr");
  });
});

describe("Price IDs Stripe (STRIPE_PRICE_ID_<PACK>)", () => {
  const starter = PACKS.find((p) => p.key === "starter")!;

  it("Price ID fourni -> ligne { price } au lieu de price_data", () => {
    const params = buildCheckoutSessionParams(starter, "u", "https://margemax.com", null, "price_123");
    expect(params.line_items?.[0]).toEqual({ quantity: 1, price: "price_123" });
  });

  it("nom de variable par pack, sans accent", () => {
    const names = PACKS.map((p) => priceIdEnvName(p));
    expect(names).toEqual([
      "STRIPE_PRICE_ID_STARTER",
      "STRIPE_PRICE_ID_ESSENTIEL",
      "STRIPE_PRICE_ID_AVANCE",
      "STRIPE_PRICE_ID_PRO",
      "STRIPE_PRICE_ID_ULTIMATE",
    ]);
  });

  it("Price ID incohérent (montant, devise, récurrent, inactif) -> refusé", () => {
    const ok = { active: true, currency: "eur", unit_amount: 299, type: "one_time" };
    expect(isPriceIdUsable(ok, starter)).toBe(true);
    expect(isPriceIdUsable({ ...ok, unit_amount: 799 }, starter)).toBe(false);
    expect(isPriceIdUsable({ ...ok, currency: "usd" }, starter)).toBe(false);
    expect(isPriceIdUsable({ ...ok, type: "recurring" }, starter)).toBe(false);
    expect(isPriceIdUsable({ ...ok, active: false }, starter)).toBe(false);
  });
});
