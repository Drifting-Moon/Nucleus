import { describe, expect, it } from "vitest";
import { calculateScore, getScoreTier } from "./calculate-score";

describe("calculateScore", () => {
  it("returns ratio for number UoM", () => {
    expect(
      calculateScore({ uom: "number", target: 100, achievement: 80, scoreDirection: "higher" })
    ).toBe(0.8);
  });

  it("returns 0 when target is zero", () => {
    expect(
      calculateScore({ uom: "number", target: 0, achievement: 50, scoreDirection: "higher" })
    ).toBe(0);
  });

  it("zero_based: achievement 0 scores 1.0", () => {
    expect(calculateScore({ uom: "zero_based", target: null, achievement: 0 })).toBe(1);
  });

  it("caps ratio at 1.5", () => {
    expect(
      calculateScore({ uom: "number", target: 10, achievement: 20, scoreDirection: "higher" })
    ).toBe(1.5);
  });
});

describe("getScoreTier", () => {
  it("maps tiers", () => {
    expect(getScoreTier(1)).toBe("green");
    expect(getScoreTier(0.7)).toBe("yellow");
    expect(getScoreTier(0.3)).toBe("red");
  });
});
