"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  step: number;
  label: string;
  done: boolean;
  active: boolean;
}

export function WorkflowStep({
  step,
  label,
  done,
  active,
}: WorkflowStepProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
          done
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
            : active
            ? "bg-primary/15 text-primary border-2 border-primary/40"
            : "bg-muted text-muted-foreground border border-border/60"
        )}
      >
        {done ? <Check className="h-3 w-3" /> : step}
      </div>
      <span
        className={cn(
          "text-xs font-bold transition-colors",
          done || active ? "text-foreground" : "text-muted-foreground/50"
        )}
      >
        {label}
      </span>
    </div>
  );
}
