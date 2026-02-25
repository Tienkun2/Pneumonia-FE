"use client";

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
} from "recharts";
import { Users, AlertTriangle, Clock, Activity, TrendingUp, UserPlus, FileHeart } from "lucide-react";
import { DiagnosisCard } from "@/components/medical/diagnosis-card";

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
    color: "text-red-600",
    bg: "bg-red-50",
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
    color: "text-blue-600",
    bg: "bg-blue-50",
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan bệnh án nhi khoa (1-5 tuổi)
        </p>
      </div>

      {/* Stats Cards - Premium Styling */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[hsl(var(--primary))] to-transparent opacity-50" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg || "bg-primary/10"}`}>
                  <Icon className={`h-4 w-4 ${stat.color || "text-primary"}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts - Premium Styling */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Bệnh nhi mới theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={patientsPerDay}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
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
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileHeart className="h-5 w-5 text-primary" />
              Phân loại nguy cơ bệnh lý phổi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={riskDistribution} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis dataKey="risk" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Diagnoses */}
      <Card>
        <CardHeader>
          <CardTitle>Chẩn đoán gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: "d001",
                patientName: "Nguyễn Văn A",
                date: new Date().toISOString(),
                overallRisk: 85,
                riskLevel: "Cao" as const,
                imageRisk: 88,
                clinicalRisk: 82,
                findings: "Phát hiện dấu hiệu viêm phổi ở thùy dưới phổi phải",
              },
              {
                id: "d002",
                patientName: "Trần Thị B",
                date: new Date(Date.now() - 12 * 60000).toISOString(),
                overallRisk: 45,
                riskLevel: "Trung bình" as const,
                imageRisk: 40,
                clinicalRisk: 50,
                findings: "Dấu hiệu nhẹ, cần theo dõi thêm",
              },
              {
                id: "d003",
                patientName: "Lê Văn C",
                date: new Date(Date.now() - 18 * 60000).toISOString(),
                overallRisk: 25,
                riskLevel: "Thấp" as const,
                imageRisk: 20,
                clinicalRisk: 30,
                findings: "Không phát hiện dấu hiệu bất thường",
              },
            ].map((diagnosis) => (
              <DiagnosisCard
                key={diagnosis.id}
                {...diagnosis}
                compact={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
