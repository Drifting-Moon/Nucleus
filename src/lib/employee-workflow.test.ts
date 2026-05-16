import { describe, expect, it } from "vitest";
import { getWorkflowCurrentIndex } from "@/lib/employee-workflow";

describe("getWorkflowCurrentIndex", () => {
  it("advances to the latest submitted quarter when demo windows overlap", () => {
    const index = getWorkflowCurrentIndex(
      [{ status: "approved" }],
      {
        q1: false,
        q2: false,
        q3: false,
        annual: true,
      }
    );

    expect(index).toBe(6);
  });
});
