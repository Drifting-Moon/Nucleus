"use client";

import type { TooltipContentProps } from "recharts";

/** Stops tooltips from sliding in from the top-left (default Recharts animation). */
export const chartTooltipMotionProps = {
  isAnimationActive: false,
  animationDuration: 0,
  wrapperStyle: { zIndex: 50, outline: "none" },
} as const;

type ChartTooltipBoxProps = {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function ChartTooltipBox({ active, children, className }: ChartTooltipBoxProps) {
  if (!active) return null;

  return (
    <div
      className={
        className ??
        "rounded-md border bg-popover px-3 py-2 text-sm font-sans text-popover-foreground shadow-md"
      }
    >
      {children}
    </div>
  );
}

export type RechartsTooltipProps = TooltipContentProps<number, string>;
