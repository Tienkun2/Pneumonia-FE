"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Curb65CalculatorProps {
  readonly onScoreChange?: (score: number) => void;
  readonly patientBirthDate?: string;
}

interface Criterion {
  id: string;
  label: string;
  description: string;
}

const CRITERIA: Criterion[] = [
  {
    id: "C",
    label: "C - Confusion",
    description: "Lơ mơ, lú lẫn, mất định hướng mới xuất hiện",
  },
  {
    id: "U",
    label: "U - Urea",
    description: "Urea huyết > 7 mmol/L (hoặc BUN > 19 mg/dL)",
  },
  {
    id: "R",
    label: "R - Respiratory Rate",
    description: "Tần số thở ≥ 30 lần/phút",
  },
  {
    id: "B",
    label: "B - Blood Pressure",
    description: "Huyết áp tâm thu < 90 mmHg hoặc huyết áp tâm trương ≤ 60 mmHg",
  },
  {
    id: "65",
    label: "65 - Age ≥ 65",
    description: "Tuổi bệnh nhân từ 65 trở lên",
  },
];

export function Curb65Calculator({ onScoreChange, patientBirthDate }: Curb65CalculatorProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    C: false,
    U: false,
    R: false,
    B: false,
    65: false,
  });

  useEffect(() => {
    if (!patientBirthDate) {
      setSelected((prev) => (prev["65"] ? { ...prev, 65: false } : prev));
      return;
    }
    try {
      const birthDate = new Date(patientBirthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      const isOver65 = age >= 65;
      setSelected((prev) => (prev["65"] !== isOver65 ? { ...prev, 65: isOver65 } : prev));
    } catch (e) {
      console.error("Failed to parse patient birth date for CURB-65:", e);
    }
  }, [patientBirthDate]);

  const toggleCriterion = (id: string) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const score = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  const getRiskDetails = (totalScore: number) => {
    if (totalScore <= 1) {
      return {
        group: "Nhóm 1 (Nguy cơ thấp)",
        mortality: "Tỷ lệ tử vong 30 ngày: < 3%",
        recommendation: "Điều trị ngoại trú",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        badgeColor: "bg-emerald-500 text-white",
      };
    } else if (totalScore === 2) {
      return {
        group: "Nhóm 2 (Nguy cơ trung bình)",
        mortality: "Tỷ lệ tử vong 30 ngày: ~ 9%",
        recommendation: "Nhập viện điều trị nội trú ngắn hạn hoặc theo dõi rất sát ngoại trú",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        badgeColor: "bg-amber-500 text-white",
      };
    } else {
      return {
        group: "Nhóm 3 (Nguy cơ cao)",
        mortality: "Tỷ lệ tử vong 30 ngày: 15% - 22%",
        recommendation: "Nhập viện điều trị nội trú khẩn cấp, nếu ≥ 4 điểm cân nhắc chuyển ICU",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
        badgeColor: "bg-red-500 text-white",
      };
    }
  };

  const risk = getRiskDetails(score);

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
      <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/30">
        <CardTitle className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
          <Stethoscope className="h-3.5 w-3.5 text-primary" /> Thang điểm lâm sàng CURB-65
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Checklist */}
        <div className="space-y-2.5">
          {CRITERIA.map((criterion) => (
            <div
              key={criterion.id}
              onClick={() => toggleCriterion(criterion.id)}
              className={cn(
                "flex items-start gap-3 p-2.5 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/30 transition-all cursor-pointer select-none",
                selected[criterion.id] && "border-primary/30 bg-primary/5"
              )}
            >
              <Checkbox
                checked={selected[criterion.id]}
                onCheckedChange={() => toggleCriterion(criterion.id)}
                className="mt-0.5"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="space-y-0.5">
                <p className={cn("text-xs font-bold text-foreground", selected[criterion.id] && "text-primary")}>
                  {criterion.label}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground leading-snug">
                  {criterion.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Result Panel */}
        <div className={cn("border rounded-xl p-3.5 flex flex-col gap-2.5 transition-all", risk.color)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-90">Điểm số CURB-65</span>
              <Badge className={cn("rounded-md text-[10px] font-black border-none", risk.badgeColor)}>
                {score} / 5
              </Badge>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">{risk.group}</span>
          </div>

          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", risk.badgeColor)}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>

          <div className="space-y-1 mt-0.5">
            <p className="text-xs font-bold leading-normal flex items-start gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70" />
              Đề xuất: {risk.recommendation}
            </p>
            <p className="text-[10px] font-bold opacity-80 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              {risk.mortality}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
