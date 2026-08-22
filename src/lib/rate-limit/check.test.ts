import { describe, it, expect } from "vitest";
import { getClientIp } from "./check";

describe("getClientIp", () => {
  it("extracts the first IP from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.4, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("203.0.113.4");
  });

  it("trims whitespace around the IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "  203.0.113.4  , 10.0.0.1",
    });
    expect(getClientIp(headers)).toBe("203.0.113.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.7" });
    expect(getClientIp(headers)).toBe("198.51.100.7");
  });

  it("falls back to 'unknown' when neither header is present", () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });
});
