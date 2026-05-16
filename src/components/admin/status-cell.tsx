import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import type { CellStatus } from "@/lib/admin/completion-data";
import { cn } from "@/lib/utils";

export function StatusCell({ status }: { status: CellStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center justify-center text-emerald-600" title="Done">
        <CheckCircle2 className="size-4" />
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center justify-center text-red-600" title="Not done">
        <XCircle className="size-4" />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center justify-center text-muted-foreground")}
      title="Not applicable / window not open"
    >
      <MinusCircle className="size-4" />
    </span>
  );
}
