"use client";

import Link from "next/link";
import { Stethoscope, UserPlus, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

export function DashboardHeader() {
  const { user } = useAppSelector((state) => state.auth);
  const firstName = user?.displayName?.split(" ").pop() || user?.username || "Bác sĩ";

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/50">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Chào mừng, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <CalendarCheck className="h-4 w-4" />
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long", day: "2-digit", month: "long", year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/medical/patient-mgmt/patient-list">
          <Button variant="outline" className="rounded-xl bg-card hover:bg-muted/50 border-border/60 shadow-sm transition-all h-9 px-4 text-sm font-medium">
            <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
            Thêm bệnh nhân
          </Button>
        </Link>
        <Link href="/medical/ai-diagnosis/analysis">
          <Button className="rounded-xl shadow-sm transition-all h-9 px-4 text-sm font-medium">
            <Stethoscope className="h-4 w-4 mr-2" />
            Chẩn đoán mới
          </Button>
        </Link>
      </div>
    </div>
  );
}
