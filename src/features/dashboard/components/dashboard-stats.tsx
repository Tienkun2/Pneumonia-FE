"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Panel, TrendLine } from "./dashboard-ui";
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
              <Panel key={s.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wide">
                    {s.delta}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.title}</p>
                </div>
                <TrendLine up={s.delta !== "FULL"} />
              </Panel>
            );
          })}
    </div>
  );
}
