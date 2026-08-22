import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmailWithFallback } from "./send-with-fallback";

const PAYLOAD = { to: "user@example.com", subject: "Test", html: "<p>hi</p>" };

describe("sendEmailWithFallback", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    global.fetch = vi.fn();
    process.env.RESEND_API_KEY = "fake-resend-key";
    process.env.BREVO_API_KEY = "fake-brevo-key";
    process.env.EMAIL_FROM_ADDRESS = "sender@example.com";
    process.env.EMAIL_FROM_NAME = "Test Sender";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("succeeds via the primary provider (resend) without touching brevo", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: async () => "",
    } as Response);

    const result = await sendEmailWithFallback(PAYLOAD);

    expect(result.success).toBe(true);
    expect(result.attempts).toEqual([{ provider: "resend", success: true }]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = vi.mocked(global.fetch).mock.calls[0]!;
    const body = JSON.parse(options!.body as string);
    expect(body.from).toBe("Test Sender <sender@example.com>");
  });

  it("falls back to brevo when resend fails", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => "invalid from field",
      } as Response)
      .mockResolvedValueOnce({ ok: true, text: async () => "" } as Response);

    const result = await sendEmailWithFallback(PAYLOAD);

    expect(result.success).toBe(true);
    expect(result.attempts).toEqual([
      {
        provider: "resend",
        success: false,
        error: expect.stringContaining("422"),
      },
      { provider: "brevo", success: true },
    ]);
  });

  it("respects EMAIL_PROVIDER=brevo as primary instead of always defaulting to resend", async () => {
    process.env.EMAIL_PROVIDER = "brevo";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: async () => "",
    } as Response);

    await sendEmailWithFallback(PAYLOAD);

    const [url] = vi.mocked(global.fetch).mock.calls[0]!;
    expect(url).toContain("brevo.com");
  });

  it("returns success: false when every provider fails", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "server error",
    } as Response);

    const result = await sendEmailWithFallback(PAYLOAD);

    expect(result.success).toBe(false);
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts.every((a) => !a.success)).toBe(true);
  });

  it("skips a provider whose API key isn't configured, without wasting a request on it", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    delete process.env.BREVO_API_KEY;
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "server error",
    } as Response);

    const result = await sendEmailWithFallback(PAYLOAD);

    expect(result.attempts).toContainEqual({
      provider: "brevo",
      success: false,
      error: "not configured",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
