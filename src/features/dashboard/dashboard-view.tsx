"use client";

import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { DashboardCharts } from "./components/dashboard-charts";
import { DashboardActivity } from "./components/dashboard-activity";

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
