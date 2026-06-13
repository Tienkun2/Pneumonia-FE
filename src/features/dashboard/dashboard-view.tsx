"use client";

import dynamic from "next/dynamic";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { DashboardActivity } from "./components/dashboard-activity";

import { Skeleton } from "@/components/ui/skeleton";

const DashboardCharts = dynamic(
  () => import("./components/dashboard-charts").then((mod) => mod.DashboardCharts),
  { 
    ssr: false, 
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    )
  }
);

export function DashboardView() {
  const { isLoading, trends, diagStats, recentVisits, stats, summary } = useDashboardData();
  const totalVisitsCount = summary?.totalVisits || 0;

  return (
    <div className="flex flex-col gap-5 pb-8 animate-in fade-in duration-300">
      <DashboardHeader />
      
      <DashboardStats 
        isLoading={isLoading} 
        stats={stats} 
      />
      
      <DashboardCharts 
        isLoading={isLoading}
        trends={trends}
        diagStats={diagStats}
        totalVisitsCount={totalVisitsCount}
      />
      

      
      <DashboardActivity 
        isLoading={isLoading}
        recentVisits={recentVisits}
      />
    </div>
  );
}
