"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Map, AlertTriangle, TrendingUp, TrendingDown, Users, ShieldAlert, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DistrictData {
  id: string;
  name: string;
  totalCases: number;
  highRiskCases: number;
  avgAge: number;
  trend: "up" | "down";
  trendValue: number;
  riskRatio: number; // percentage of high risk
  svgPath: string;
  centerX: number;
  centerY: number;
}

const DISTRICTS_MOCK: DistrictData[] = [
  {
    id: "dist-central",
    name: "Quận 1 (Trung tâm)",
    totalCases: 95,
    highRiskCases: 38,
    avgAge: 64,
    trend: "up",
    trendValue: 12.5,
    riskRatio: 40,
    // Stylized path in 400x300 canvas
    svgPath: "M 130 90 L 270 90 L 230 180 L 170 180 Z",
    centerX: 200,
    centerY: 130,
  },
  {
    id: "dist-north",
    name: "Quận 2 (Phía Bắc)",
    totalCases: 48,
    highRiskCases: 12,
    avgAge: 56,
    trend: "down",
    trendValue: 4.2,
    riskRatio: 25,
    svgPath: "M 130 90 L 270 90 L 200 20 L Z",
    centerX: 200,
    centerY: 60,
  },
  {
    id: "dist-east",
    name: "Quận 3 (Phía Đông)",
    totalCases: 76,
    highRiskCases: 29,
    avgAge: 68,
    trend: "up",
    trendValue: 8.7,
    riskRatio: 38,
    svgPath: "M 270 90 L 370 150 L 230 180 Z",
    centerX: 290,
    centerY: 140,
  },
  {
    id: "dist-south",
    name: "Quận 4 (Phía Nam)",
    totalCases: 35,
    highRiskCases: 7,
    avgAge: 42,
    trend: "down",
    trendValue: 2.1,
    riskRatio: 20,
    svgPath: "M 170 180 L 230 180 L 200 260 Z",
    centerX: 200,
    centerY: 210,
  },
  {
    id: "dist-west",
    name: "Quận 5 (Phía Tây)",
    totalCases: 62,
    highRiskCases: 24,
    avgAge: 71,
    trend: "up",
    trendValue: 14.8,
    riskRatio: 38,
    svgPath: "M 130 90 L 170 180 L 70 150 Z",
    centerX: 120,
    centerY: 140,
  },
];

export function EpidemiologicalMap() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(DISTRICTS_MOCK[0]);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);
  const [timeFilter, setTimeFilter] = useState("THIS_MONTH");

  const getRiskColor = (ratio: number) => {
    if (ratio >= 35) return "fill-red-500/20 stroke-red-500 hover:fill-red-500/30";
    if (ratio >= 25) return "fill-amber-500/20 stroke-amber-500 hover:fill-amber-500/30";
    return "fill-emerald-500/20 stroke-emerald-500 hover:fill-emerald-500/30";
  };

  const getRiskBadgeColor = (ratio: number) => {
    if (ratio >= 35) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (ratio >= 25) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  };

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
      <CardHeader className="px-6 py-5 border-b border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
            <Map className="h-4 w-4 text-primary" /> Bản đồ phân bố dịch tễ học viêm phổi
          </CardTitle>
          <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
            Phân tích số liệu và mức độ nguy cơ theo khu vực địa lý của bệnh nhân
          </p>
        </div>

        <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/50 shrink-0">
          {["THIS_MONTH", "THIS_QUARTER"].map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer",
                timeFilter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "THIS_MONTH" ? "Tháng này" : "Quý này"}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Map View Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-muted/10 border border-border/30 rounded-2xl p-4 min-h-[300px]">
            <svg
              viewBox="0 0 400 280"
              className="w-full max-w-[420px] aspect-[4/3] drop-shadow-2xl"
            >
              {DISTRICTS_MOCK.map((district) => (
                <path
                  key={district.id}
                  d={district.svgPath}
                  className={cn(
                    "transition-all duration-300 stroke-[2] cursor-pointer",
                    getRiskColor(district.riskRatio),
                    selectedDistrict?.id === district.id ? "stroke-[3.5] opacity-100 fill-primary/10" : "opacity-85"
                  )}
                  onClick={() => setSelectedDistrict(district)}
                  onMouseEnter={() => setHoveredDistrict(district)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
              ))}

              {/* Text labels on SVG */}
              {DISTRICTS_MOCK.map((district) => (
                <text
                  key={`text-${district.id}`}
                  x={district.centerX}
                  y={district.centerY}
                  textAnchor="middle"
                  className={cn(
                    "font-mono text-[9px] font-black pointer-events-none select-none tracking-wider transition-all duration-200 fill-foreground",
                    selectedDistrict?.id === district.id ? "fill-primary font-black scale-105" : "opacity-70"
                  )}
                >
                  {district.name.split(" ")[0]} {district.name.split(" ")[1]}
                </text>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredDistrict && (
              <div
                className="absolute bg-card/95 border border-border/70 shadow-2xl p-3 rounded-xl pointer-events-none text-xs w-[180px] animate-in fade-in duration-200"
                style={{
                  top: "20px",
                  left: "20px",
                }}
              >
                <p className="font-black text-foreground mb-1">{hoveredDistrict.name}</p>
                <div className="space-y-1 text-muted-foreground font-semibold text-[10px]">
                  <p className="flex justify-between">
                    <span>Tổng ca:</span> <span className="text-foreground">{hoveredDistrict.totalCases}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Nguy cơ cao:</span> <span className="text-red-500 font-bold">{hoveredDistrict.highRiskCases}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Độ tuổi TB:</span> <span className="text-foreground">{hoveredDistrict.avgAge}</span>
                  </p>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] font-bold text-muted-foreground bg-card/80 border border-border/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Nguy cơ cao</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Nghi ngờ</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Nguy cơ thấp</span>
            </div>
          </div>

          {/* Details Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedDistrict ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-sm font-black text-foreground">{selectedDistrict.name}</h3>
                  <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-none px-2.5 py-0.5 rounded-md", getRiskBadgeColor(selectedDistrict.riskRatio))}>
                    Tỷ lệ rủi ro: {selectedDistrict.riskRatio}%
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 border border-border/40 p-3 rounded-xl">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">Tổng ca chẩn đoán</p>
                     <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-foreground">{selectedDistrict.totalCases}</span>
                        <span className="text-[10px] text-muted-foreground">bệnh nhân</span>
                     </div>
                  </div>
                  <div className="bg-muted/30 border border-border/40 p-3 rounded-xl">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">Ca nguy cơ cao</p>
                     <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-red-500">{selectedDistrict.highRiskCases}</span>
                        <span className="text-[10px] text-red-500/80 font-bold">({Math.round((selectedDistrict.highRiskCases / selectedDistrict.totalCases) * 100)}%)</span>
                     </div>
                  </div>
                </div>

                {/* Additional Specs */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-1 border-b border-border/20 text-xs">
                     <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Độ tuổi trung bình mắc bệnh</span>
                     <span className="font-bold text-foreground">{selectedDistrict.avgAge} tuổi</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/20 text-xs">
                     <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                       {selectedDistrict.trend === "up" ? (
                         <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                       ) : (
                         <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                       )}
                       Biến động so với tháng trước
                     </span>
                     <span className={cn("font-bold", selectedDistrict.trend === "up" ? "text-red-500" : "text-emerald-500")}>
                        {selectedDistrict.trend === "up" ? "+" : "-"}{selectedDistrict.trendValue}%
                     </span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-xs">
                     <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Chu kỳ phân tích</span>
                     <span className="font-bold text-foreground">Hằng tháng</span>
                  </div>
                </div>

                {/* Hotspot bar */}
                <div className="space-y-1.5 pt-2">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Mật độ ca bệnh</span>
                      <span>{selectedDistrict.totalCases} / 150 (Giới hạn)</span>
                   </div>
                   <Progress value={(selectedDistrict.totalCases / 150) * 100} className="h-2 rounded-full" />
                </div>
                
                <div className="flex gap-2 p-3 rounded-lg border border-red-500/10 bg-red-500/5 items-start">
                   <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                   <p className="text-[10px] leading-relaxed text-red-600 dark:text-red-400 font-bold">
                      Khu vực này có tỷ lệ ca bệnh nguy cơ cao vượt ngưỡng an toàn (phát hiện thâm nhiễm lan rộng). Yêu cầu khoa Khám bệnh tăng cường sàng lọc.
                   </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                 <ShieldAlert className="h-10 w-10 opacity-20 mb-3" />
                 <p className="text-xs italic font-bold">Nhấp vào một phân vùng trên bản đồ để xem thống kê chi tiết khu vực</p>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
