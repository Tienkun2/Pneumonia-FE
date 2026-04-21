"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

interface RecommendItemProps {
  icon: React.ElementType;
  text: string;
  color: string;
  bg: string;
}

export function RecommendItem({ icon: Icon, text, color, bg }: RecommendItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 hover:border-border/60 transition-all group">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="text-sm font-semibold text-foreground">{text}</p>
      <Check className="h-3.5 w-3.5 text-muted-foreground/30 ml-auto" />
    </div>
  );
}
