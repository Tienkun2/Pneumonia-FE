"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel, SectionTitle } from "./dashboard-ui";
import { useState, useCallback } from "react";
import { getDiagnosisTranslation } from "@/constants/dashboard";

interface ChartDataPoint {
  date: string;
  visits: number;
}

interface DiagnosisStatPoint {
  label: string;
  count: number;
}

interface DashboardChartsProps {
  isLoading: boolean;
  trends: ChartDataPoint[];
  diagStats: DiagnosisStatPoint[];
  totalVisitsCount: number;
}

interface VisitTooltipPayload {
  value: number;
}

interface VisitTooltipProps {
  active?: boolean;
  payload?: VisitTooltipPayload[];
  label?: string;
}

const VisitTooltip = ({ active, payload, label }: VisitTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3.5 py-2.5 text-xs min-w-[120px]">
      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-foreground font-bold text-sm tabular-nums">{payload[0].value}</span>
        <span className="text-muted-foreground">lượt khám</span>
      </div>
    </div>
  );
};

interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
}

const renderActiveShape = (props: unknown) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props as ActiveShapeProps;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 4}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      className="outline-none"
    />
  );
};

const PIE_COLORS: Record<string, string> = {
  NORMAL: "#10B981",
  PNEUMONIA: "#EF4444",
};

export function DashboardCharts({ isLoading, trends, diagStats, totalVisitsCount }: DashboardChartsProps) {
  const [activeDonutIndex, setActiveDonutIndex] = useState(0);
  
  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveDonutIndex(index);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Panel className="lg:col-span-2 flex flex-col">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <SectionTitle>Lượt khám theo ngày</SectionTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Tần suất chẩn đoán 7 ngày gần nhất</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12.5%</span>
          </div>
        </div>

        <div className="p-5 pt-6">
          {isLoading ? (
            <Skeleton className="h-[220px] w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.split("-").slice(1).reverse().join("/")}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                  tickMargin={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip content={<VisitTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1.5 }} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#visitGradient)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))", fill: "hsl(var(--primary))" }}
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <Panel className="flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <SectionTitle>Tỷ lệ bệnh lý</SectionTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Phân loại kết quả chẩn đoán</p>
        </div>

        <div className="flex-1 flex flex-col p-5 pt-6 items-center">
          {isLoading ? (
            <Skeleton className="h-44 w-44 rounded-full mx-auto" />
          ) : (
            <>
              <div className="relative w-full h-[190px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeDonutIndex}
                      activeShape={renderActiveShape}
                      data={diagStats.map((s) => ({ ...s, name: getDiagnosisTranslation(s.label) }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                      stroke="none"
                      onMouseEnter={onPieEnter}
                      animationDuration={900}
                    >
                      {diagStats.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={PIE_COLORS[entry.label] ?? "#94A3B8"}
                          className="outline-none cursor-pointer"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[32px] font-bold text-foreground tabular-nums leading-none">
                    {diagStats[activeDonutIndex]?.count ?? totalVisitsCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                    {diagStats[activeDonutIndex]
                      ? getDiagnosisTranslation(diagStats[activeDonutIndex].label)
                      : "Tổng ca"}
                  </p>
                </div>
              </div>

              <div className="mt-2 w-full flex flex-col gap-2">
                {diagStats.map((stat, i) => {
                  const pct = totalVisitsCount > 0
                    ? Math.round((stat.count / totalVisitsCount) * 100)
                    : 0;
                  const color = PIE_COLORS[stat.label] ?? "#94A3B8";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveDonutIndex(i)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer text-left w-full ${
                        activeDonutIndex === i
                          ? "border-border bg-muted/60"
                          : "border-transparent bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-none">
                            {getDiagnosisTranslation(stat.label)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {stat.label === "NORMAL" ? "Ổn định" : "Cần theo dõi"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 shrink-0">
                        <span className="text-sm font-bold text-foreground tabular-nums">{stat.count}</span>
                        <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
