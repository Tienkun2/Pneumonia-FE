"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  AlertTriangle,
  Clock,
  Activity,
  UserPlus,
  FileHeart,
  Stethoscope,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";

// Dữ liệu tạm thời để hiển thị khi chưa có API
const statsData = [
  {
    title: "Tổng số ca",
    value: "1,234",
    icon: Users,
    change: "+12%",
  },
  {
    title: "Nguy cơ cao",
    value: "89",
    icon: AlertTriangle,
    change: "+5%",
    description: "Cần chú ý đặc biệt",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    title: "Thời gian xử lý TB",
    value: "2.4 phút",
    icon: Clock,
    change: "-8%",
  },
  {
    title: "Hoạt động hôm nay",
    value: "156",
    icon: Activity,
    change: "+23%",
    description: "Tăng so với hôm qua",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const patientsPerDay = [
  { date: "01/01", patients: 45 },
  { date: "02/01", patients: 52 },
  { date: "03/01", patients: 48 },
  { date: "04/01", patients: 61 },
  { date: "05/01", patients: 55 },
  { date: "06/01", patients: 58 },
  { date: "07/01", patients: 64 },
];

const riskDistribution = [
  { risk: "Thấp", count: 850, color: "hsl(var(--success))" },
  { risk: "Trung bình", count: 295, color: "hsl(var(--warning))" },
  { risk: "Cao", count: 89, color: "hsl(var(--destructive))" },
];

export function DashboardView() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập load dữ liệu để test skeleton
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan"
        icon={LayoutDashboard}
      >
        <Link href="/diagnosis">
          <Button className="rounded-lg px-4 h-9 gap-2">
            <Stethoscope className="h-4 w-4" /> <span className="font-medium">Chẩn đoán mới</span>
          </Button>
        </Link>
        <Link href="/patients">
          <Button variant="outline" className="rounded-lg px-4 h-9 gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" /> <span className="font-medium">Thêm bệnh nhân</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards - Skeleton Support */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? new Array(4).fill(0).map((_, i) => (
            <Card key={`skeleton-stat-${i}`} className="overflow-hidden border border-border shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-12" />
              </CardContent>
            </Card>
          ))
          : statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        }
      </div>

      {/* Charts - Skeleton Support */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {isLoading ? <Skeleton className="h-6 w-40" /> : "Bệnh nhân mới theo ngày"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-[240px] w-full rounded-xl" />
              : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={patientsPerDay}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="patients"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPatients)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )
            }
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileHeart className="h-5 w-5 text-primary" />
              {isLoading ? <Skeleton className="h-6 w-40" /> : "Phân loại nguy cơ bệnh lý phổi"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-[240px] w-full rounded-xl" />
              : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={riskDistribution} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                    <XAxis dataKey="risk" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8_px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.risk} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
