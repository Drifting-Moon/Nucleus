import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
  title: string;
  description: string;
}

interface QuickGuideProps {
  role: "Employee" | "Manager" | "Admin";
  steps: Step[];
}

export function QuickGuide({ role, steps }: QuickGuideProps) {
  return (
    <Card className="mb-6 border-border/60 bg-muted/30">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{role} Workflow Guide</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <li key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-semibold">
                  {index + 1}
                </span>
                {step.title}
              </div>
              <p className="text-xs text-muted-foreground pl-7">{step.description}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
