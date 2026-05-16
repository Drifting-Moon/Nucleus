import { describe, expect, it } from "vitest";
import { calculateWeightedOverallScore } from "./calculate-weighted-score";

describe("calculateWeightedOverallScore", () => {
  it("returns null with no submitted updates", () => {
    expect(
      calculateWeightedOverallScore([{ id: "g1", weightage: 100 }], [])
    ).toBeNull();
  });

  it("computes weighted average as display percent", () => {
    const score = calculateWeightedOverallScore(
      [
        { id: "g1", weightage: 60 },
        { id: "g2", weightage: 40 },
      ],
      [
        { goal_id: "g1", score: 1, submitted_at: "2026-01-01" },
        { goal_id: "g2", score: 0.5, submitted_at: "2026-01-01" },
      ]
    );
    expect(score).toBe(80);
  });
});
