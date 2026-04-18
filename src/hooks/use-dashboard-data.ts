import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { DashboardService } from "@/services/dashboard-service";
import { 
  Visit, 
  DashboardSummary, 
  VisitTrend, 
  DiagnosisStat 
} from "@/types";
import { 
  LayoutDashboard, 
  Clock, 
  Activity, 
  Users 
} from "lucide-react";

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<VisitTrend[]>([]);
  const [diagStats, setDiagStats] = useState<DiagnosisStat[]>([]);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sum, trnd, diag, recent] = await Promise.all([
          DashboardService.getSummary(),
          DashboardService.getVisitTrends("7d"),
          DashboardService.getDiagnosisStats(),
          DashboardService.getRecentVisits(5),
        ]);
        setSummary(sum);
        setTrends(trnd);
        setDiagStats(diag);
        setRecentVisits(recent);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
