"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RISKS_MAP } from "@/constants/diagnosis";

interface ScoreRingProps {
  value: number;
  riskLevel: string;
}

export function ScoreRing({ value, riskLevel }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);
  const risk = RISKS_MAP[riskLevel] ?? RISKS_MAP["Unknown"];
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

  const strokeColor =
    riskLevel === "HIGH"
      ? "#ef4444"
      : riskLevel === "MEDIUM"
      ? "#f59e0b"
      : "#10b981";

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
          <span className={cn("text-3xl font-black tabular-nums leading-none", risk.color)}>
            {displayed}%
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Nguy cơ
          </span>
        </div>
      </div>
      <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full border", risk.border, risk.bg)}>
        <div className={cn("w-2 h-2 rounded-full animate-pulse", risk.dot)} />
        <span className={cn("text-xs font-black uppercase tracking-wider", risk.color)}>
          {risk.label}
        </span>
      </div>
    </div>
  );
}
