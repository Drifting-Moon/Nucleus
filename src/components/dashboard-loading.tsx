"use client";

export function DashboardLoading({ label = "Loading your dashboard..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 animate-in fade-in duration-500">
      <div className="relative flex size-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="size-2 rounded-full bg-primary" />
      </div>
      {label && <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">{label}</p>}
    </div>
  );
}
