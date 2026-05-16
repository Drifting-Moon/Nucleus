"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import animationData from "../../public/loading.json";

const Lottie = dynamic(() => import("lottie-react"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
    </div>
  )
});

export function DashboardLoading({ label = "Loading your dashboard..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12">
      <div className="w-64 h-64 relative flex items-center justify-center">
         <Lottie animationData={animationData} loop={true} className="w-full h-full" />
      </div>
      {label && <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">{label}</p>}
    </div>
  );
}
