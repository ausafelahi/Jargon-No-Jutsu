import { describe, it, expect } from "vitest";
import { generatedTheorySchema } from "./schema";

describe("generatedTheorySchema", () => {
  it("accepts a valid theory body", () => {
    const valid = {
      title: "Understanding Lazy Evaluation",
      content: "A".repeat(500),
    };
    expect(() => generatedTheorySchema.parse(valid)).not.toThrow();
  });

  it("rejects content shorter than the long-form minimum", () => {
    const invalid = {
      title: "Understanding Lazy Evaluation",
      content: "Too short to be long-form content.",
    };
    expect(() => generatedTheorySchema.parse(invalid)).toThrow();
  });

  it("rejects a title that's just a couple words (too short)", () => {
    const invalid = {
      title: "Short",
      content: "A".repeat(500),
    };
    expect(() => generatedTheorySchema.parse(invalid)).toThrow();
  });

  it("rejects content over the max length", () => {
    const invalid = {
      title: "Understanding Lazy Evaluation",
      content: "A".repeat(7000),
    };
    expect(() => generatedTheorySchema.parse(invalid)).toThrow();
  });
});
