"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TableToolbarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function TableToolbar({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  className,
  children,
}: TableToolbarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      <div className="relative w-full max-w-[280px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9 h-9 rounded-lg border-border bg-background shadow-sm transition-all focus:ring-2 focus:ring-primary/20"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {children && (
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {children}
        </div>
      )}
    </div>
  );
}
