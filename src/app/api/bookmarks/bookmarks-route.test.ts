import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const rateLimitMock = vi.fn();
const getClaimsMock = vi.fn();
const insertChainMock = vi.fn();
const deleteChainMock = vi.fn();

vi.mock("@/lib/rate-limit/check", () => ({
  checkRateLimit: (...args: unknown[]) => rateLimitMock(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getClaims: getClaimsMock },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => insertChainMock(),
        }),
      }),
      delete: () => ({
        eq: () => ({
          eq: () => deleteChainMock(),
        }),
      }),
    }),
  }),
}));

const { POST, DELETE } = await import("./route");

function makePostRequest(body: unknown) {
  return new NextRequest(new URL("/api/bookmarks", "http://localhost:3000"), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(lessonId: string) {
  return new NextRequest(
    new URL(`/api/bookmarks?lessonId=${lessonId}`, "http://localhost:3000"),
    { method: "DELETE" },
  );
}

describe("POST /api/bookmarks", () => {
  beforeEach(() => {
    rateLimitMock.mockReset();
    getClaimsMock.mockReset();
    insertChainMock.mockReset();
    rateLimitMock.mockResolvedValue({ allowed: true });
  });

  it("returns 401 when there's no signed-in user", async () => {
    getClaimsMock.mockResolvedValue({ data: null });

    const res = await POST(makePostRequest({ lessonId: "lesson-1" }));

    expect(res.status).toBe(401);
  });

  it("returns 400 when lessonId is missing from the body", async () => {
    getClaimsMock.mockResolvedValue({ data: { claims: { sub: "user-1" } } });

    const res = await POST(makePostRequest({}));

    expect(res.status).toBe(400);
  });

  it("creates a bookmark and returns 201 on success", async () => {
    getClaimsMock.mockResolvedValue({ data: { claims: { sub: "user-1" } } });
    insertChainMock.mockResolvedValue({ data: { id: "bm-1" }, error: null });

    const res = await POST(makePostRequest({ lessonId: "lesson-1" }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.bookmarked).toBe(true);
  });

  it("treats an already-bookmarked lesson (unique constraint) as idempotent success", async () => {
    getClaimsMock.mockResolvedValue({ data: { claims: { sub: "user-1" } } });
    insertChainMock.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate" },
    });

    const res = await POST(makePostRequest({ lessonId: "lesson-1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.bookmarked).toBe(true);
  });

  it("returns 429 when the per-user rate limit is exceeded", async () => {
    getClaimsMock.mockResolvedValue({ data: { claims: { sub: "user-1" } } });
    rateLimitMock.mockResolvedValue({ allowed: false });

    const res = await POST(makePostRequest({ lessonId: "lesson-1" }));

    expect(res.status).toBe(429);
    expect(insertChainMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/bookmarks", () => {
  beforeEach(() => {
    rateLimitMock.mockReset();
    getClaimsMock.mockReset();
    deleteChainMock.mockReset();
    rateLimitMock.mockResolvedValue({ allowed: true });
  });

  it("returns 401 when there's no signed-in user", async () => {
    getClaimsMock.mockResolvedValue({ data: null });

    const res = await DELETE(makeDeleteRequest("lesson-1"));

    expect(res.status).toBe(401);
  });

  it("removes the bookmark on success", async () => {
    getClaimsMock.mockResolvedValue({ data: { claims: { sub: "user-1" } } });
    deleteChainMock.mockResolvedValue({ error: null });

    const res = await DELETE(makeDeleteRequest("lesson-1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.bookmarked).toBe(false);
  });
});
