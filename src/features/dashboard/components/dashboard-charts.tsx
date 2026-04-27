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
    <div className="bg-card border border-border/60 rounded-xl shadow-lg px-4 py-3 min-w-[140px]">
      <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-2 font-medium">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-foreground font-semibold text-xl tabular-nums">{payload[0].value}</span>
        <span className="text-muted-foreground text-[13px]">lượt khám</span>
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
      innerRadius={innerRadius}
      outerRadius={outerRadius + 4}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      className="outline-none"
    />
  );
};

const PIE_COLORS: Record<string, string> = {
  NORMAL: "#10B981", // Emerald 500
  PNEUMONIA: "#F87171", // Red 400 (softer red)
};

export function DashboardCharts({ isLoading, trends, diagStats, totalVisitsCount }: DashboardChartsProps) {
  const [activeDonutIndex, setActiveDonutIndex] = useState(0);
  const [timeRange, setTimeRange] = useState("7D");
  
  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveDonutIndex(index);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Panel className="lg:col-span-2 flex flex-col">
        <div className="px-6 py-5 border-b border-border/40 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <SectionTitle>Lượt khám theo ngày</SectionTitle>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span>+12.5%</span>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
              <span>📈</span> Lượt khám tăng nhẹ trong {timeRange === "7D" ? "7 ngày" : timeRange === "30D" ? "30 ngày" : "3 tháng"} qua
            </p>
          </div>
          
          <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/50 shrink-0">
            {["7D", "30D", "90D"].map(r => (
               <button 
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    timeRange === r 
                      ? 'bg-card text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
               >
                 {r}
               </button>
            ))}
          </div>
        </div>

        <div className="p-6 pt-8 pb-4">
          {isLoading ? (
            <Skeleton className="h-[240px] w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeDasharray="4 4"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.split("-").slice(1).reverse().join("/")}
                  fontSize={12}
                  stroke="hsl(var(--muted-foreground))"
                  tickMargin={16}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip 
                  content={<VisitTooltip />} 
                  cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }} 
                />
                <Area 
                  type="monotone"
                  dataKey="visits" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#visitGradient)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <Panel className="flex flex-col">
        <div className="px-6 py-5 border-b border-border/40">
          <SectionTitle>Tỷ lệ bệnh lý</SectionTitle>
          <p className="text-[13px] text-muted-foreground mt-0.5">Phân loại kết quả chẩn đoán</p>
        </div>

        <div className="flex-1 flex flex-col p-6 items-center">
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
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={8}
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

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                  <p className="text-[42px] font-black text-foreground tabular-nums leading-none tracking-tighter">
                    {diagStats[activeDonutIndex]?.count ?? totalVisitsCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                    {diagStats[activeDonutIndex]
                      ? getDiagnosisTranslation(diagStats[activeDonutIndex].label)
                      : "Tổng ca"}
                  </p>
                </div>
              </div>

              <div className="mt-8 w-full flex flex-col gap-3">
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
                      className={`flex items-center justify-between py-3 px-4 transition-all cursor-pointer text-left w-full rounded-xl ${
                        activeDonutIndex === i
                          ? "bg-muted/40 shadow-sm border border-border/50"
                          : "bg-transparent border border-transparent hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <p className={`text-sm font-semibold leading-none ${activeDonutIndex === i ? 'text-foreground' : 'text-foreground/80'}`}>
                            {getDiagnosisTranslation(stat.label)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {stat.label === "NORMAL" ? "Ổn định" : "Cần theo dõi"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[15px] font-bold text-foreground tabular-nums">{stat.count}</span>
                        <span className="text-xs text-muted-foreground font-medium">{pct}%</span>
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
