import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  RATE_LIMITS: { contactByIp: { maxAttempts: 5, windowSeconds: 3600, lockSeconds: 3600 } },
  checkRateLimit: vi.fn(async () => true),
  getClientIp: vi.fn(() => "203.0.113.1"),
}));

const VALID_BODY = {
  name: "Jimmy",
  email: "jimmy@example.com",
  message: "Bonjour, j'ai une question.",
};

function postContact(body: unknown, POST: (req: Request) => Promise<Response>) {
  const request = new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(request);
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ message, name: "validation_error" }), { status });
}

/**
 * route.ts lit RESEND_API_KEY/RESEND_FROM_EMAIL
 * en constantes de module (une seule fois, au premier import) -- vi.resetModules()
 * + réimport dynamique APRÈS avoir positionné process.env est donc
 * nécessaire pour que chaque test parte d'une configuration propre,
 * plutôt qu'un vi.stubEnv() qui n'aurait aucun effet après le premier
 * import du module.
 */
async function loadRouteWithEnv(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return import("./route");
}

const ORIGINAL_ENV = { ...process.env };

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("envoie le message quand Resend répond OK", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRouteWithEnv({ RESEND_API_KEY: "re_test_key" });
    const response = await postContact(VALID_BODY, POST);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejette une requête sans nom/email/message avant tout appel à Resend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRouteWithEnv({ RESEND_API_KEY: "re_test_key" });
    const response = await postContact({ name: "", email: "", message: "" }, POST);
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejette une adresse e-mail mal formée sans appeler Resend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRouteWithEnv({ RESEND_API_KEY: "re_test_key" });
    const response = await postContact({ ...VALID_BODY, email: "pas-un-email" }, POST);
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envoie en un seul appel : from par défaut, to fixe, reply_to = e-mail du visiteur", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRouteWithEnv({
      RESEND_API_KEY: "re_test_key",
      RESEND_FROM_EMAIL: undefined,
    });
    await postContact(VALID_BODY, POST);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.from).toBe("MargeMax <contact@autoutilshop.fr>");
    expect(sent.to).toEqual(["contact@autoutilshop.fr"]);
    expect(sent.reply_to).toBe(VALID_BODY.email);
  });

  it("erreur Resend -> 500 propre, aucune nouvelle tentative, détail loggé mais pas exposé", async () => {
    const fetchMock = vi.fn(async () =>
      jsonError("The autoutilshop.fr domain is not verified.", 403)
    );
    vi.stubGlobal("fetch", fetchMock);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await loadRouteWithEnv({ RESEND_API_KEY: "re_test_key" });
    const response = await postContact(VALID_BODY, POST);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.ok).toBeUndefined();
    expect(body.error).toMatch(/impossible d'envoyer/i);
    expect(body.error).not.toContain("domain");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "Resend delivery failed:",
      403,
      expect.stringContaining("not verified")
    );
    errorSpy.mockRestore();
  });

  it("panne réseau vers Resend -> 500 propre, pas d'exception non gérée", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    vi.stubGlobal("fetch", fetchMock);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await loadRouteWithEnv({ RESEND_API_KEY: "re_test_key" });
    const response = await postContact(VALID_BODY, POST);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/impossible d'envoyer/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it("RESEND_API_KEY absente -> message explicite, aucun appel réseau tenté", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRouteWithEnv({ RESEND_API_KEY: undefined });
    const response = await postContact(VALID_BODY, POST);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toMatch(/pas encore configuré/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
