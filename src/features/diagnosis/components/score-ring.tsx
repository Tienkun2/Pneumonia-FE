"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RISKS_MAP } from "@/constants/diagnosis";

interface ScoreRingProps {
  value: number;
  riskLevel: string;
  threshold?: number;
}

export function ScoreRing({ value, riskLevel, threshold }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);
  const pct = Math.round(value * 100);

  useEffect(() => {
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      setDisplayed(Math.round((frame / total) * pct));
      if (frame >= total) clearInterval(timer);
    }, 1000 / total);
    return () => clearInterval(timer);
  }, [pct]);

  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = (displayed / 100) * circ;

  const thresholdVal = threshold ?? 0.665;
  const isPositive = value >= thresholdVal;
  const isNearThreshold = pct >= 60 && pct <= 66;

  const colorKey = isPositive ? "HIGH" : (isNearThreshold ? "MEDIUM" : "LOW");
  const risk = RISKS_MAP[colorKey] ?? RISKS_MAP["Unknown"];

  const strokeColor =
    colorKey === "HIGH"
      ? "#ef4444"
      : colorKey === "MEDIUM"
      ? "#f59e0b"
      : "#10b981";

  const displayedColor =
    colorKey === "HIGH"
      ? "text-red-500"
      : colorKey === "MEDIUM"
      ? "text-amber-500"
      : "text-emerald-500";

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/30"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.05s linear", filter: `drop-shadow(0 0 6px ${strokeColor}55)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-black tabular-nums leading-none tracking-tight", displayedColor)}>
            {displayed}%
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
            tin cậy AI
          </span>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 mt-0.5">
            (Ngưỡng: {(thresholdVal * 100).toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm", risk.border, risk.bg)}>
        <div className={cn("w-2 h-2 rounded-full animate-pulse", risk.dot)} />
        <span className={cn("text-xs font-black uppercase tracking-wider", risk.color)}>
          {isPositive ? "Nghi ngờ viêm phổi" : "Chưa phát hiện"}
        </span>
      </div>
      {isNearThreshold && (
        <div className="flex items-center justify-center gap-1 text-[11px] font-black text-amber-600 dark:text-amber-500 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Sát ngưỡng → Cân nhắc lâm sàng</span>
        </div>
      )}
    </div>
  );
}
