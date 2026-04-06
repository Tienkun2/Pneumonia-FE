"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  readonly title: string;
  readonly icon: LucideIcon;
  readonly description?: string;
  readonly className?: string;
  readonly children?: React.ReactNode;
}

export function PageHeader({
  title,
  icon: Icon,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6", className)}>
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 mt-1 sm:mt-0">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
