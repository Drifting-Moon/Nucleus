"use client";

import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface QuickGuideProps {
  role: "Employee" | "Manager" | "Admin";
  steps: Step[];
  defaultOpen?: boolean;
}

export function QuickGuide({ role, steps, defaultOpen = true }: QuickGuideProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="mb-6 border-border/60 bg-muted/30 print:hidden">
      <CardContent className="py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-muted-foreground" />
            {role} Workflow Guide
          </span>
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>
        {open ? (
          <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={index} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  {step.title}
                </div>
                <p className="pl-7 text-xs text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
