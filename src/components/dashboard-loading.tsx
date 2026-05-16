export function DashboardLoading({ label = "Loading dashboard…" }: { label?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div
          className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
