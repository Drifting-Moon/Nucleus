"use client";

import { Info } from "lucide-react";
import { getScoreFormulaLabel } from "@/lib/score-formula";

type ScoreFormulaHintProps = {
  uom: string | null | undefined;
  scoreDirection?: string | null;
};

export function ScoreFormulaHint({ uom, scoreDirection }: ScoreFormulaHintProps) {
  const label = getScoreFormulaLabel(uom, scoreDirection);

  return (
    <span className="group relative inline-flex">
      <Info
        className="size-3.5 cursor-help text-muted-foreground"
        aria-label="How score is calculated"
      />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-md group-hover:block group-focus-within:block"
      >
        {label}
      </span>
    </span>
  );
}
