"use client";

import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = "Đang tải dữ liệu..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-12 h-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] animate-pulse">
        {label}
      </p>
    </div>
  );
}
