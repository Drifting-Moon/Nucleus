import { describe, expect, it } from "vitest";
import { buildEscalationData } from "@/lib/admin/escalation-data";

const users = [
  {
    id: "manager-1",
    name: "Mira Manager",
    email: "mira@example.com",
    role: "manager",
    department: "Sales",
    manager_id: null,
  },
  {
    id: "employee-1",
    name: "Eli Employee",
    email: "eli@example.com",
    role: "employee",
    department: "Sales",
    manager_id: "manager-1",
  },
  {
    id: "employee-2",
    name: "Nia Needs Review",
    email: "nia@example.com",
    role: "employee",
    department: "Sales",
    manager_id: "manager-1",
  },
];

describe("buildEscalationData", () => {
  it("creates goal submission and manager approval escalation logs", () => {
    const result = buildEscalationData(
      users,
      [
        {
          id: "goal-2",
          user_id: "employee-2",
          status: "submitted",
          updated_at: "2026-05-01T00:00:00.000Z",
        },
      ],
      [],
      [{ quarter_name: "goal_setting", start_date: "2026-05-01", end_date: "2026-05-05" }],
      undefined,
      new Date("2026-05-10T00:00:00.000Z")
    );

    expect(result.logs.map((log) => log.ruleType)).toContain("goal_submission_overdue");
    expect(result.logs.map((log) => log.ruleType)).toContain("manager_approval_overdue");
    expect(result.summary.totalOpen).toBe(2);
  });

  it("monitors active check-in windows before marking them overdue", () => {
    const result = buildEscalationData(
      users,
      [
        {
          id: "goal-1",
          user_id: "employee-1",
          status: "approved",
          updated_at: "2026-05-01T00:00:00.000Z",
        },
      ],
      [],
      [{ quarter_name: "q1", start_date: "2026-05-10", end_date: "2026-05-20" }],
      undefined,
      new Date("2026-05-15T00:00:00.000Z")
    );

    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]).toMatchObject({
      ruleType: "checkin_overdue",
      status: "monitoring",
      daysOverdue: 0,
    });
  });
});
