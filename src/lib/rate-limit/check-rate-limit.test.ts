import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: rpcMock }),
}));

const { checkRateLimit } = await import("./check");

describe("checkRateLimit", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("allows the request when the RPC returns true", async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });

    const result = await checkRateLimit("1.2.3.4", {
      name: "search",
      limit: 30,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(true);
  });

  it("denies the request when the RPC returns false", async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });

    const result = await checkRateLimit("1.2.3.4", {
      name: "search",
      limit: 30,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(false);
  });

  it("calls the RPC with the correctly namespaced key", async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });

    await checkRateLimit("1.2.3.4", {
      name: "search",
      limit: 30,
      windowSeconds: 60,
    });

    expect(rpcMock).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "search:1.2.3.4",
      p_limit: 30,
      p_window_seconds: 60,
    });
  });

  it("fails open (allows the request) when the RPC call errors", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "connection refused" },
    });

    const result = await checkRateLimit("1.2.3.4", {
      name: "search",
      limit: 30,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(true);
  });
});
