"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "./dashboard-ui";
import { LucideIcon } from "lucide-react";

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  delta: string;
}

interface DashboardStatsProps {
  isLoading: boolean;
  stats: StatItem[];
}

export function DashboardStats({ isLoading, stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
          <Panel key={i} className="p-4 space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-2 w-24" />
          </Panel>
        ))
        : stats.map((s) => {
          const Icon = s.icon;
          return (
            <Panel key={s.id} className="p-5 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{s.title}</span>
                <Icon className="h-4 w-4 text-muted-foreground/60" />
              </div>
              
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-semibold text-foreground tabular-nums tracking-tight leading-none">{s.value}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    s.delta !== "FULL" && !s.delta.includes("-") 
                      ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                      : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                  }`}>
                    {s.delta !== "FULL" && !s.delta.includes("-") ? `↑ ${s.delta}` : s.delta}
                  </span>
                  {s.delta !== "FULL" && (
                    <span className="text-xs text-muted-foreground font-medium">tuần này</span>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
    </div>
  );
}
