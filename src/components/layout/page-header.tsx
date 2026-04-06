"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon: LucideIcon;
  readonly description?: string;
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly stats?: StatItem[];
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  description,
  className,
  children,
  stats,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Main header row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-foreground tracking-tight leading-tight">{title}</h1>
            {(subtitle || description) && (
              <p className="text-[12.5px] text-muted-foreground font-medium mt-0.5">{subtitle || description}</p>
            )}
          </div>
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2">
            {children}
          </div>
        )}
      </div>

      {/* Optional statistics strip */}
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2 bg-card rounded-xl px-4 py-2.5 shadow-sm border border-border/50">
              <span className={cn("text-[20px] font-black leading-none", stat.color || "text-foreground")}>
                {stat.value}
              </span>
              <span className="text-[12px] font-semibold text-muted-foreground leading-tight max-w-[80px]">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
