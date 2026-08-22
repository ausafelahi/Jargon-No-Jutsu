import { describe, it, expect } from "vitest";
import { computeNextStreak } from "./record-activity";

const TODAY = "2026-08-17";
const YESTERDAY = "2026-08-16";
const TWO_DAYS_AGO = "2026-08-15";

describe("computeNextStreak", () => {
  it("starts at 1/1 for a brand new user with no prior record", () => {
    const result = computeNextStreak(null, TODAY, YESTERDAY);
    expect(result).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  it("continues the streak when last active was yesterday", () => {
    const existing = {
      current_streak: 4,
      longest_streak: 4,
      last_active_date: YESTERDAY,
    };
    const result = computeNextStreak(existing, TODAY, YESTERDAY);
    expect(result).toEqual({ currentStreak: 5, longestStreak: 5 });
  });

  it("does not change anything if already recorded today", () => {
    const existing = {
      current_streak: 5,
      longest_streak: 5,
      last_active_date: TODAY,
    };
    const result = computeNextStreak(existing, TODAY, YESTERDAY);
    expect(result).toEqual({ currentStreak: 5, longestStreak: 5 });
  });

  it("resets to 1 when a day was missed", () => {
    const existing = {
      current_streak: 10,
      longest_streak: 10,
      last_active_date: TWO_DAYS_AGO,
    };
    const result = computeNextStreak(existing, TODAY, YESTERDAY);
    expect(result).toEqual({ currentStreak: 1, longestStreak: 10 });
  });

  it("preserves longest_streak even after a reset", () => {
    const existing = {
      current_streak: 15,
      longest_streak: 20,
      last_active_date: TWO_DAYS_AGO,
    };
    const result = computeNextStreak(existing, TODAY, YESTERDAY);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(20);
  });

  it("updates longest_streak when current streak surpasses it", () => {
    const existing = {
      current_streak: 9,
      longest_streak: 9,
      last_active_date: YESTERDAY,
    };
    const result = computeNextStreak(existing, TODAY, YESTERDAY);
    expect(result).toEqual({ currentStreak: 10, longestStreak: 10 });
  });

  it("resets to 1 when last_active_date is null (edge case, shouldn't normally happen)", () => {
    const existing = {
      current_streak: 3,
      longest_streak: 3,
      last_active_date: null,
    };
    const result = computeNextStreak(existing, TODAY, YESTERDAY);
    expect(result).toEqual({ currentStreak: 1, longestStreak: 3 });
  });
});
