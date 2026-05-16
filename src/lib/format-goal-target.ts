import { formatDisplayDate } from "@/lib/format-date";

export function formatGoalTarget(
  uom: string | null | undefined,
  target: number | null | "" | undefined,
  targetDate: string | null | undefined
): string {
  if (uom === "timeline") {
    return targetDate ? formatDisplayDate(targetDate) : "Not set";
  }

  if (uom === "percentage" && target !== null && target !== "" && target !== undefined) {
    return `${target}%`;
  }

  if (uom === "zero_based") {
    return "0 = success";
  }

  if (target === null || target === "" || target === undefined) {
    return "Not set";
  }

  return String(target);
}

export function formatUomLabel(uom: string | null | undefined): string {
  switch (uom) {
    case "number":
      return "Number";
    case "percentage":
      return "Percentage";
    case "timeline":
      return "Timeline";
    case "zero_based":
      return "Zero-based";
    default:
      return uom || "Not set";
  }
}
