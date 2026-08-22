import { describe, it, expect } from "vitest";
import { selectNextPairing } from "./select-pairing";
import { CHARACTER_CONCEPT_POOL } from "@/lib/anilist/character-pool";
import type { Lesson } from "@/types/database";

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: "test-id",
    character_name: "Minato Namikaze",
    anime_name: "Naruto",
    image_url: null,
    concept: "Caching",
    lesson: "test",
    career_advice: "test",
    tier: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("selectNextPairing", () => {
  it("returns a pairing from the pool when there is no previous lesson", () => {
    const result = selectNextPairing(null);
    expect(CHARACTER_CONCEPT_POOL).toContainEqual(result);
  });

  it("never returns the same character as the previous lesson", () => {
    const previous = makeLesson({
      character_name: "Minato Namikaze",
      concept: "Caching",
    });

    for (let i = 0; i < 200; i++) {
      const result = selectNextPairing(previous);
      expect(result.character).not.toBe("Minato Namikaze");
    }
  });

  it("never returns the same concept as the previous lesson", () => {
    const previous = makeLesson({
      character_name: "Minato Namikaze",
      concept: "Caching",
    });

    for (let i = 0; i < 200; i++) {
      const result = selectNextPairing(previous);
      expect(result.concept).not.toBe("Caching");
    }
  });

  it("falls back to the full pool if every pairing would be excluded", () => {
    const previous = makeLesson({
      character_name: "Nonexistent Character",
      concept: "Nonexistent Concept",
    });
    expect(() => selectNextPairing(previous)).not.toThrow();
    const result = selectNextPairing(previous);
    expect(CHARACTER_CONCEPT_POOL).toContainEqual(result);
  });
});
