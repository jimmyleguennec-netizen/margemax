import { describe, expect, it } from "vitest";

import { PACKS } from "@/lib/packs";
import { buildCheckoutSessionParams } from "@/lib/stripe-checkout";

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
