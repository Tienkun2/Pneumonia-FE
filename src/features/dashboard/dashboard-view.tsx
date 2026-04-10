"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  Activity,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";

/* ─── Dữ liệu mock ─────────────────────────────────────────────── */
const stats = [
  {
    id: "visits",
    title: "Tổng lượt khám",
    value: "10,525",
    delta: "+15.2%",
    positive: true,
    icon: Users,
    color: {
      text: "text-blue-500",
      bg: "bg-blue-500/10",
      pill: "bg-blue-500",
      line: "#3b82f6",
      gradient: ["rgba(59,130,246,0.15)", "rgba(59,130,246,0)"],
    },
    sub: "786 lượt hôm nay",
    sparkline: [30, 45, 40, 55, 50, 62, 58, 72, 68, 80, 75, 86],
  },
  {
    id: "emergency",
    title: "Ca cấp cứu",
    value: "6,860",
    delta: "+12.4%",
    positive: true,
    icon: AlertTriangle,
    color: {
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      pill: "bg-emerald-500",
      line: "#10b981",
      gradient: ["rgba(16,185,129,0.15)", "rgba(16,185,129,0)"],
    },
    sub: "89 ca hôm nay",
    sparkline: [20, 35, 28, 42, 38, 50, 45, 55, 48, 60, 55, 65],
  },
  {
    id: "wait",
    title: "TG chờ trung bình",
    value: "12 phút",
    delta: "-15%",
    positive: false,
    icon: Clock,
    color: {
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      pill: "bg-slate-800 dark:bg-slate-700",
      line: "#f59e0b",
      gradient: ["rgba(245,158,11,0.15)", "rgba(245,158,11,0)"],
    },
    sub: "Đạt chuẩn WHO",
    sparkline: [55, 48, 52, 42, 47, 38, 43, 35, 40, 32, 30, 28],
  },
  {
    id: "revenue",
    title: "Doanh thu ước tính",
    value: "830M",
    delta: "+18.5%",
    positive: true,
    icon: Activity,
    color: {
      text: "text-purple-500",
      bg: "bg-purple-500/10",
      pill: "bg-slate-800 dark:bg-slate-700",
      line: "#a855f7",
      gradient: ["rgba(168,85,247,0.15)", "rgba(168,85,247,0)"],
    },
    sub: "Phòng YC: 450M | Phòng chung: 380M",
    sparkline: [25, 38, 32, 48, 42, 56, 50, 63, 58, 70, 66, 78],
  },
];

const weeklyPatients = [
  { day: "T2", value: 850 },
  { day: "T3", value: 700 },
  { day: "T4", value: 615 },
  { day: "T5", value: 800 },
  { day: "T6", value: 650 },
  { day: "T7", value: 560 },
  { day: "CN", value: 380 },
];

const appointments = [
  {
    time: "09:00",
    period: "SA",
    name: "Nguyễn Văn An",
    type: "Tái khám phổi",
    avatar: "NA",
    statusColor: "bg-emerald-500",
  },
  {
    time: "10:30",
    period: "SA",
    name: "Trần Thị Bé",
    type: "Chụp X-Quang",
    avatar: "TB",
    statusColor: "bg-amber-500",
  },
  {
    time: "01:15",
    period: "CH",
    name: "Lê Hoàng Cường",
    type: "Đo hô hấp ký",
    avatar: "LC",
    statusColor: "bg-blue-500",
  },
  {
    time: "03:00",
    period: "CH",
    name: "Phạm Thị Điệp",
    type: "Tư vấn phác đồ",
    avatar: "PD",
    statusColor: "bg-slate-300",
  },
];

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
];

/* ─── Sparkline mini ────────────────────────────────────────────── */
function Sparkline({ data, lineColor, gradientColors }: { data: number[]; lineColor: string; gradientColors: string[] }) {
  const id = `grad-${lineColor.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={lineColor} strokeWidth={2} fill={`url(#${id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Tooltip tùy chỉnh ─────────────────────────────────────────── */
function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload?.length) {
    return (
      <div className="bg-card rounded-2xl shadow-xl border border-border/50 px-4 py-3 text-sm font-semibold">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        <p className="text-foreground text-base">{payload[0].value} bệnh nhân</p>
      </div>
    );
  }
  return null;
}

/* ─── Main Component ────────────────────────────────────────────── */
export function DashboardView() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const firstName = user?.displayName?.split(" ").pop() || user?.username || "Bác sĩ";

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-7 pb-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div className="space-y-1">
          <h1 className="text-[26px] font-black text-foreground tracking-tight leading-tight">
            Chào mừng, Bs. {firstName} 👋
          </h1>
          <p className="text-[14px] text-muted-foreground font-medium">
            Tổng quan hệ thống • Cập nhật 7 ngày gần nhất
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/medical/patient-mgmt/patient-list">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-9 bg-card border-border/60 shadow-sm text-[13px] font-semibold hover:bg-muted/30">
              <UserPlus className="h-3.5 w-3.5" /> Thêm bệnh nhân
            </Button>
          </Link>
          <Link href="/diagnosis">
            <Button size="sm" className="rounded-full gap-1.5 h-9 shadow-md shadow-primary/20 text-[13px] font-semibold">
              <Stethoscope className="h-3.5 w-3.5" /> Chẩn đoán mới
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 border border-border/50 bg-card shadow-sm rounded-full px-4 h-9 cursor-pointer hover:bg-muted/20 transition-colors">
            <span className="text-[13px] font-semibold text-foreground leading-none">Tuần này</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-[20px] p-5 shadow-sm border border-border/50 space-y-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))
          : stats.map((s) => {
              const Icon = s.icon;
              const DeltaIcon = s.positive ? TrendingUp : TrendingDown;
              return (
                <div
                  key={s.id}
                  className="bg-card rounded-[20px] p-5 shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300 flex flex-col gap-3"
                >
                  {/* Row 1 – icon + label */}
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${s.color.bg} flex items-center justify-center`}>
                      <Icon className={`h-3.5 w-3.5 ${s.color.text}`} />
                    </div>
                    <span className="text-[12.5px] font-semibold text-muted-foreground leading-none">
                      {s.title}
                    </span>
                  </div>

                  {/* Row 2 – value + badge */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-[30px] font-black text-foreground leading-none tracking-tight">
                      {s.value}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-white ${s.color.pill} leading-none`}
                    >
                      <DeltaIcon className="h-2.5 w-2.5" />
                      {s.delta}
                    </span>
                  </div>

                  {/* Row 3 – mini sparkline */}
                  <div className="-mx-1">
                    <Sparkline
                      data={s.sparkline}
                      lineColor={s.color.line}
                      gradientColors={s.color.gradient}
                    />
                  </div>

                  {/* Row 4 – sub label */}
                  <p className="text-[12px] font-semibold text-muted-foreground leading-none pt-0.5">
                    {s.sub}
                  </p>
                </div>
              );
            })}
      </div>

      {/* ── Bottom Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Bar Chart Card ──────────────────────────────────── */}
        <div className="lg:col-span-2 bg-card rounded-[20px] shadow-sm border border-border/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-[15px] font-black text-foreground">Thống kê Bệnh nhân</h2>
              <p className="text-[12px] font-medium text-muted-foreground">Tổng số lượt khám theo từng ngày trong tuần</p>
            </div>
            <div className="flex items-center gap-4 text-[11.5px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
                Ngoại trú
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
                Nội trú
              </span>
            </div>
          </div>

          <div className="flex-1 px-2 pb-4">
            {isLoading ? (
              <Skeleton className="h-[260px] w-full rounded-xl mx-4" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyPatients} barSize={28} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.12} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={14}
                    fontSize={12}
                    fontWeight={700}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    fontWeight={600}
                    stroke="hsl(var(--muted-foreground))"
                    tickMargin={8}
                    width={55}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {weeklyPatients.map((entry) => (
                      <Cell key={entry.day} fill="url(#barGrad)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Appointments Card ───────────────────────────────── */}
        <div className="bg-card rounded-[20px] shadow-sm border border-border/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-[14px] font-black text-foreground leading-tight">Lịch Khám Hôm Nay</h2>
                <p className="text-[11px] font-semibold text-muted-foreground">{appointments.length} lịch hẹn</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-[12px] font-bold text-primary hover:bg-primary/10 rounded-full gap-1 h-8 px-3">
              Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[62px] w-full rounded-2xl" />
              ))
            ) : (
              appointments.map((apt, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/40 hover:shadow-sm"
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black shrink-0 ${avatarColors[i % avatarColors.length]}`}
                  >
                    {apt.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {apt.name}
                    </p>
                    <p className="text-[11px] font-semibold text-muted-foreground truncate">{apt.type}</p>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[12px] font-black text-foreground">{apt.time}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${apt.statusColor}`} />
                      {apt.period}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom total mini-strip */}
          {!isLoading && (
            <div className="mx-4 mb-4 mt-2 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-center justify-between">
              <span className="text-[12px] font-bold text-primary">Hoàn thành hôm nay</span>
              <span className="text-[13px] font-black text-primary">12 / 16 ca</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
