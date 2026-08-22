import { describe, it, expect } from "vitest";
import { parseTheoryOutput } from "./generate-theory";

describe("parseTheoryOutput", () => {
  it("parses clean, well-formatted output", () => {
    const raw = `TITLE: Understanding Lazy Evaluation\n===CONTENT===\nLazy evaluation is a strategy.\nIt has multiple paragraphs.`;
    const result = parseTheoryOutput(raw);
    expect(result.title).toBe("Understanding Lazy Evaluation");
    expect(result.content).toContain("Lazy evaluation is a strategy.");
  });

  it("tolerates the model adding preamble text before the markers", () => {
    const raw = `Sure, here's the article:\n\nTITLE: Understanding Lazy Evaluation\n===CONTENT===\nContent here.`;
    const result = parseTheoryOutput(raw);
    expect(result.title).toBe("Understanding Lazy Evaluation");
    expect(result.content).toBe("Content here.");
  });

  it("preserves quotes, apostrophes, and newlines in content without breaking", () => {
    const raw = `TITLE: The "Cache" Problem\n===CONTENT===\nIt's a "tricky" problem with lots of 'quotes' and\nnewlines\nand more.`;
    const result = parseTheoryOutput(raw);
    expect(result.title).toBe('The "Cache" Problem');
    expect(result.content).toContain('It\'s a "tricky" problem');
    expect(result.content).toContain("\n");
  });

  it("throws when the content marker is missing", () => {
    expect(() =>
      parseTheoryOutput("TITLE: Something\nJust some text with no marker"),
    ).toThrow();
  });

  it("throws when the title marker is missing", () => {
    expect(() =>
      parseTheoryOutput("===CONTENT===\nJust content, no title"),
    ).toThrow();
  });

  it("throws on an empty title", () => {
    expect(() =>
      parseTheoryOutput("TITLE: \n===CONTENT===\nSome content"),
    ).toThrow();
  });

  it("throws on empty content", () => {
    expect(() =>
      parseTheoryOutput("TITLE: Something\n===CONTENT===\n   "),
    ).toThrow();
  });
});
