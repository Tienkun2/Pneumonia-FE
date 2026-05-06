import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard-service";
import { 
  LayoutDashboard, 
  Clock, 
  Activity, 
  Users 
} from "lucide-react";

export function useDashboardData() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => DashboardService.getSummary(),
    staleTime: 5 * 60 * 1000,
  });

  const trendsQuery = useQuery({
    queryKey: ["dashboard-trends", "7d"],
    queryFn: () => DashboardService.getVisitTrends("7d"),
    staleTime: 5 * 60 * 1000,
  });

  const diagStatsQuery = useQuery({
    queryKey: ["dashboard-diag-stats"],
    queryFn: () => DashboardService.getDiagnosisStats(),
    staleTime: 5 * 60 * 1000,
  });

  const recentVisitsQuery = useQuery({
    queryKey: ["dashboard-recent-visits"],
    queryFn: () => DashboardService.getRecentVisits(5),
    staleTime: 1 * 60 * 1000,
  });

  const isLoading = summaryQuery.isLoading || trendsQuery.isLoading || diagStatsQuery.isLoading || recentVisitsQuery.isLoading;

  const summary = summaryQuery.data || null;
  const trends = trendsQuery.data || [];
  const diagStats = diagStatsQuery.data || [];
  const recentVisits = recentVisitsQuery.data || [];

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        id: "visits",
        title: "Tổng lượt khám",
        value: summary.totalVisits.toLocaleString(),
        delta: `+${summary.percentageIncrease}%`,
        icon: LayoutDashboard,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        id: "today",
        title: "Khám hôm nay",
        value: summary.todayVisits.toLocaleString(),
        delta: "Live",
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        id: "patients",
        title: "Tổng bệnh nhân",
        value: summary.totalPatients.toLocaleString(),
        delta: "New",
        icon: Activity,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        id: "users",
        title: "Nhân viên",
        value: summary.totalUsers.toLocaleString(),
        delta: "Full",
        icon: Users,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
    ];
  }, [summary]);

  return {
    isLoading,
    summary,
    trends,
    diagStats,
    recentVisits,
    stats,
  };
}
