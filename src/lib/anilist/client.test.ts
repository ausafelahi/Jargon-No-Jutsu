import { describe, it, expect } from "vitest";
import { stripHtml } from "./client";

describe("stripHtml", () => {
  it("removes simple tags", () => {
    expect(stripHtml("<p>Hello world</p>")).toBe("Hello world");
  });

  it("removes nested and multiple tags", () => {
    expect(stripHtml("<b>Bold</b> and <i>italic</i> text")).toBe(
      "Bold and italic text",
    );
  });

  it("trims surrounding whitespace after stripping", () => {
    expect(stripHtml("  <p>padded</p>  ")).toBe("padded");
  });

  it("returns plain text unchanged", () => {
    expect(stripHtml("No tags here")).toBe("No tags here");
  });

  it("handles an empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("removes self-closing and br tags", () => {
    expect(stripHtml("Line one<br>Line two<br/>Line three")).toBe(
      "Line oneLine twoLine three",
    );
  });
});
