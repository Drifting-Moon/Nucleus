export type ExportRow = {
  employeeName: string;
  department: string;
  manager: string;
  thrustArea: string;
  goalTitle: string;
  uom: string;
  target: string;
  q1Achievement: string;
  q1Score: string;
  q2Achievement: string;
  q2Score: string;
  q3Achievement: string;
  q3Score: string;
  annualAchievement: string;
  annualScore: string;
  goalStatus: string;
};

const EXPORT_HEADERS: (keyof ExportRow)[] = [
  "employeeName",
  "department",
  "manager",
  "thrustArea",
  "goalTitle",
  "uom",
  "target",
  "q1Achievement",
  "q1Score",
  "q2Achievement",
  "q2Score",
  "q3Achievement",
  "q3Score",
  "annualAchievement",
  "annualScore",
  "goalStatus",
];

const HEADER_LABELS: Record<keyof ExportRow, string> = {
  employeeName: "Employee Name",
  department: "Department",
  manager: "Manager",
  thrustArea: "Thrust Area",
  goalTitle: "Goal Title",
  uom: "UoM",
  target: "Target",
  q1Achievement: "Q1 Achievement",
  q1Score: "Q1 Score",
  q2Achievement: "Q2 Achievement",
  q2Score: "Q2 Score",
  q3Achievement: "Q3 Achievement",
  q3Score: "Q3 Score",
  annualAchievement: "Annual Achievement",
  annualScore: "Annual Score",
  goalStatus: "Goal Status",
};

type ExportGoal = {
  id: string;
  user_id: string;
  thrust_area: string | null;
  title: string | null;
  uom: string | null;
  target: number | null;
  target_date: string | null;
  status: string;
};

type ExportUpdate = {
  goal_id: string;
  quarter: string;
  achievement: number | null;
  achievement_date: string | null;
  score: number | null;
};

type ExportUser = {
  id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  manager_id: string | null;
};

function formatTarget(goal: ExportGoal) {
  if (goal.uom === "timeline") return goal.target_date ?? "";
  return goal.target !== null ? String(goal.target) : "";
}

function formatAchievement(update: ExportUpdate | undefined, uom: string | null) {
  if (!update) return "";
  if (uom === "timeline") return update.achievement_date ?? "";
  return update.achievement !== null ? String(update.achievement) : "";
}

function formatScore(update: ExportUpdate | undefined) {
  if (!update || update.score === null) return "";
  return `${Math.round(update.score * 100)}%`;
}

export function buildExportRows(
  employees: ExportUser[],
  managers: ExportUser[],
  goals: ExportGoal[],
  updates: ExportUpdate[]
): ExportRow[] {
  const managerById = new Map(managers.map((manager) => [manager.id, manager]));
  const rows: ExportRow[] = [];

  for (const employee of employees) {
    const employeeGoals = goals.filter((goal) => goal.user_id === employee.id);
    const manager = employee.manager_id ? managerById.get(employee.manager_id) : null;

    for (const goal of employeeGoals) {
      const goalUpdates = updates.filter((update) => update.goal_id === goal.id);
      const byQuarter = (quarter: string) => goalUpdates.find((u) => u.quarter === quarter);

      const q1 = byQuarter("q1");
      const q2 = byQuarter("q2");
      const q3 = byQuarter("q3");
      const annual = byQuarter("annual");

      rows.push({
        employeeName: employee.name || employee.email || "",
        department: employee.department ?? "",
        manager: manager?.name || manager?.email || "",
        thrustArea: goal.thrust_area ?? "",
        goalTitle: goal.title ?? "",
        uom: goal.uom ?? "",
        target: formatTarget(goal),
        q1Achievement: formatAchievement(q1, goal.uom),
        q1Score: formatScore(q1),
        q2Achievement: formatAchievement(q2, goal.uom),
        q2Score: formatScore(q2),
        q3Achievement: formatAchievement(q3, goal.uom),
        q3Score: formatScore(q3),
        annualAchievement: formatAchievement(annual, goal.uom),
        annualScore: formatScore(annual),
        goalStatus: goal.status,
      });
    }
  }

  return rows;
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportRowsToCsv(rows: ExportRow[]): string {
  const headerLine = EXPORT_HEADERS.map((key) => HEADER_LABELS[key]).join(",");
  const dataLines = rows.map((row) =>
    EXPORT_HEADERS.map((key) => escapeCsv(row[key])).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}

/** Server-only: build Excel workbook bytes. */
export async function exportRowsToXlsxBuffer(rows: ExportRow[]): Promise<Buffer> {
  const XLSX = await import("xlsx");

  const sheetRows = rows.map((row) => {
    const record: Record<string, string> = {};
    for (const key of EXPORT_HEADERS) {
      record[HEADER_LABELS[key]] = row[key];
    }
    return record;
  });

  const sheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Goals");
  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}
