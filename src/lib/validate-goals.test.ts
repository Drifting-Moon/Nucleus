import { describe, expect, it } from "vitest";
import { validateGoals, type GoalValidationInput } from "./validate-goals";

function goal(overrides: Partial<GoalValidationInput> = {}): GoalValidationInput {
  return {
    thrust_area: "Business",
    title: "Revenue",
    weightage: 50,
    uom: "number",
    target: 100,
    target_date: "",
    ...overrides,
  };
}

describe("validateGoals", () => {
  it("requires at least one goal", () => {
    expect(validateGoals([])).toBe("Add at least one goal");
  });

  it("rejects more than 8 goals", () => {
    const goals = Array.from({ length: 9 }, (_, i) =>
      goal({ title: `G${i}`, weightage: 10 })
    );
    expect(validateGoals(goals)).toBe("Maximum 8 goals allowed");
  });

  it("rejects weightage below 10%", () => {
    expect(validateGoals([goal({ weightage: 9 }), goal({ title: "B", weightage: 91 })])).toMatch(
      /at least 10%/
    );
  });

  it("rejects total not equal to 100%", () => {
    expect(validateGoals([goal({ weightage: 40 }), goal({ title: "B", weightage: 40 })])).toMatch(
      /Total weightage is 80%/
    );
  });

  it("accepts valid sheet totalling 100%", () => {
    expect(validateGoals([goal({ weightage: 60 }), goal({ title: "B", weightage: 40 })])).toBeNull();
  });
});
