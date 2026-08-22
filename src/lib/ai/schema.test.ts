import { describe, it, expect } from "vitest";
import { generatedLessonSchema } from "./schema";

describe("generatedLessonSchema", () => {
  it("accepts a valid lesson body", () => {
    const valid = {
      explanation: "A".repeat(100),
      realWorldApplication: "B".repeat(50),
      careerAdvice: "C".repeat(30),
    };
    expect(() => generatedLessonSchema.parse(valid)).not.toThrow();
  });

  it("rejects an explanation that is too short", () => {
    const invalid = {
      explanation: "too short",
      realWorldApplication: "B".repeat(50),
      careerAdvice: "C".repeat(30),
    };
    expect(() => generatedLessonSchema.parse(invalid)).toThrow();
  });

  it("rejects a missing field entirely", () => {
    const invalid = {
      explanation: "A".repeat(100),
      careerAdvice: "C".repeat(30),
    };
    expect(() => generatedLessonSchema.parse(invalid)).toThrow();
  });

  it("rejects a realWorldApplication over the max length", () => {
    const invalid = {
      explanation: "A".repeat(100),
      realWorldApplication: "B".repeat(700),
      careerAdvice: "C".repeat(30),
    };
    expect(() => generatedLessonSchema.parse(invalid)).toThrow();
  });
});
