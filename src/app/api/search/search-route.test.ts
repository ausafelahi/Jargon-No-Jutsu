import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const rateLimitMock = vi.fn();
const supabaseQueryMock = vi.fn();

vi.mock("@/lib/rate-limit/check", () => ({
  checkRateLimit: (...args: unknown[]) => rateLimitMock(...args),
  getClientIp: () => "203.0.113.4",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        or: () => ({
          order: () => ({
            limit: () => supabaseQueryMock(),
          }),
        }),
      }),
    }),
  }),
}));

const { GET } = await import("./route");

function makeRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/search", () => {
  beforeEach(() => {
    rateLimitMock.mockReset();
    supabaseQueryMock.mockReset();
    rateLimitMock.mockResolvedValue({ allowed: true });
  });

  it("returns 429 when rate limited, without querying the DB at all", async () => {
    rateLimitMock.mockResolvedValue({ allowed: false });

    const res = await GET(makeRequest("/api/search?q=Naruto"));

    expect(res.status).toBe(429);
    expect(supabaseQueryMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the query param is missing", async () => {
    const res = await GET(makeRequest("/api/search"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/query param/i);
  });

  it("returns matching lessons on success", async () => {
    supabaseQueryMock.mockResolvedValue({
      data: [
        { id: "1", concept: "Caching", character_name: "Minato Namikaze" },
      ],
      error: null,
    });

    const res = await GET(makeRequest("/api/search?q=Minato"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.lessons).toHaveLength(1);
    expect(body.query).toBe("Minato");
  });

  it("returns 500 when the DB query fails", async () => {
    supabaseQueryMock.mockResolvedValue({
      data: null,
      error: { message: "connection lost" },
    });

    const res = await GET(makeRequest("/api/search?q=Minato"));

    expect(res.status).toBe(500);
  });
});
