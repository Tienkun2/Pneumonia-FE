"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface StatPillProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}

export function StatPill({ icon: Icon, label, value, className }: StatPillProps) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card/60", className)}>
      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
      </div>
    </div>
  );
}
