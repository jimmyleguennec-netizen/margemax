import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl } from "./site-url";

describe("getSiteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("retombe sur le domaine de production quand la variable est absente ou vide", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl()).toBe("https://margemax.com");
  });

  it("utilise la variable d'environnement et retire le slash final", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.com/");
    expect(getSiteUrl()).toBe("https://preview.example.com");
  });

  it("ignore une valeur qui n'est pas une URL http(s)", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "margemax.com");
    expect(getSiteUrl()).toBe("https://margemax.com");
  });
});
