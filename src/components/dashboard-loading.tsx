"use client";

import dynamic from "next/dynamic";
import animationData from "../../public/loading.json";

const Lottie = dynamic(() => import("lottie-react"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-full bg-primary/10 animate-pulse flex items-center justify-center">
       <div className="w-1/2 h-1/2 rounded-full bg-primary/20 animate-ping" />
    </div>
  )
});

export function DashboardLoading({ label = "Loading your dashboard..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 animate-in fade-in duration-500">
      <div className="w-64 h-64 relative flex items-center justify-center">
         <Lottie 
           animationData={animationData} 
           loop={true} 
           autoplay={true}
           initialSegment={[0, 44]}
           className="w-full h-full" 
         />
      </div>
      {label && <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">{label}</p>}
    </div>
  );
}
