import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading({ label = "Loading your dashboard..." }: { label?: string }) {
  return (
    <div className="space-y-6">
      {/* Skeleton for Quick Guide / Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      {/* Skeleton for the Main Content Area */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6 border-b">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px] mt-2" />
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-[60px] w-full rounded-lg" />
          
          <div className="space-y-3">
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
          </div>
          
          <div className="flex justify-end pt-4 border-t">
             <div className="flex gap-2">
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[120px]" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
