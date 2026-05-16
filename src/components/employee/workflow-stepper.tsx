import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getWorkflowCurrentIndex,
  isWorkflowComplete,
  WORKFLOW_STEPS,
} from "@/lib/employee-workflow";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { cn } from "@/lib/utils";

type WorkflowStepperProps = {
  goals: { status: string }[];
  quarterSubmitted: Record<CheckinQuarter, boolean>;
};

export function WorkflowStepper({ goals, quarterSubmitted }: WorkflowStepperProps) {
  const currentIndex = getWorkflowCurrentIndex(goals, quarterSubmitted);
  const allComplete = isWorkflowComplete(goals, quarterSubmitted);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
          {WORKFLOW_STEPS.map((step, index) => {
            const isComplete = allComplete || index < currentIndex;
            const isCurrent = !allComplete && index === currentIndex;

            return (
              <li key={step.id} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className="mx-0.5 text-muted-foreground">→</span>
                ) : null}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                    isComplete && "border-emerald-500/40 bg-emerald-500/10 text-emerald-800",
                    isCurrent && "border-primary bg-primary/10 font-medium text-primary",
                    !isComplete && !isCurrent && "border-border text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="size-3" /> : null}
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
