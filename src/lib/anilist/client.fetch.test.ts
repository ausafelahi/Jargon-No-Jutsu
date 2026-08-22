import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchAniListCharacter } from "./client";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("fetchAniListCharacter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns character data on a successful first attempt", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      jsonResponse({
        data: {
          Character: {
            id: 1,
            name: { full: "Minato Namikaze" },
            image: { large: "https://example.com/minato.png" },
            description: "<p>The Yellow Flash</p>",
            media: {
              nodes: [{ title: { romaji: "NARUTO", english: "Naruto" } }],
            },
          },
        },
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAniListCharacter("Minato Namikaze");

    expect(result.name).toBe("Minato Namikaze");
    expect(result.animeTitle).toBe("Naruto");
    expect(result.description).toBe("The Yellow Flash"); // HTML stripped
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on a transient HTTP failure (e.g. 404) and succeeds on the second attempt", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: "not found" }, false, 404))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            Character: {
              id: 2,
              name: { full: "Light Yagami" },
              image: { large: "https://example.com/light.png" },
              description: null,
              media: {
                nodes: [
                  { title: { romaji: "DEATH NOTE", english: "Death Note" } },
                ],
              },
            },
          },
        }),
      );
    vi.stubGlobal("fetch", mockFetch);

    const promise = fetchAniListCharacter("Light Yagami");
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(result.name).toBe("Light Yagami");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry a genuine 'character not found' (real 200 response, not transient)", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: { Character: null } }));
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      fetchAniListCharacter("Nonexistent Character"),
    ).rejects.toThrow(/not found/);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting all retry attempts on persistent failures", async () => {
    const mockFetch = vi.fn().mockResolvedValue(jsonResponse({}, false, 500));
    vi.stubGlobal("fetch", mockFetch);

    const promise = fetchAniListCharacter("Some Character");
    const expectation = expect(promise).rejects.toThrow(/500/);
    await vi.advanceTimersByTimeAsync(10000);
    await expectation;

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("surfaces GraphQL-level errors even on a 200 response, without retrying", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({
          data: { Character: null },
          errors: [{ message: "Invalid search term" }],
        }),
      );
    vi.stubGlobal("fetch", mockFetch);

    await expect(fetchAniListCharacter("bad input")).rejects.toThrow(
      /Invalid search term/,
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
