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
  Cell,
} from "recharts";
import { Users, AlertTriangle, Clock, Activity, UserPlus, FileHeart, BookOpen, Stethoscope, ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
        <div className="flex flex-wrap gap-2">
           <Link href="/diagnosis">
              <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2 h-9 px-4">
                 <Stethoscope className="h-4 w-4" /> <span className="font-medium">Chẩn đoán mới</span>
              </Button>
           </Link>
           <Link href="/patients">
              <Button variant="outline" className="rounded-lg border-slate-200 shadow-sm flex items-center gap-2 h-9 px-4">
                 <UserPlus className="h-4 w-4 text-slate-500" /> <span className="font-medium">Thêm bệnh nhân</span>
              </Button>
           </Link>
           <Link href="/comparison">
              <Button variant="outline" className="rounded-lg border-slate-200 shadow-sm flex items-center gap-2 h-9 px-4 hidden sm:flex">
                 <ArrowLeftRight className="h-4 w-4 text-slate-500" /> <span className="font-medium">So sánh</span>
              </Button>
           </Link>
           <Link href="/knowledge">
              <Button variant="outline" className="rounded-lg border-slate-200 shadow-sm flex items-center gap-2 h-9 px-4 hidden sm:flex">
                 <BookOpen className="h-4 w-4 text-slate-500" /> <span className="font-medium">Thư viện</span>
              </Button>
           </Link>
        </div>
      </div>

      {/* Stats Cards - Compact Styling */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color || "text-slate-400"}`} />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold tracking-tight text-slate-800">{stat.value}</div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stat.change}
                  </span>
                </div>
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
            <ResponsiveContainer width="100%" height={240}>
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
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskDistribution} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis dataKey="risk" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.risk} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
