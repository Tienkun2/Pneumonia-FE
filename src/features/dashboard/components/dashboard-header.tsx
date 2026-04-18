"use client";

import Link from "next/link";
import { Stethoscope, UserPlus, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

export function DashboardHeader() {
  const { user } = useAppSelector((state) => state.auth);
  const firstName = user?.displayName?.split(" ").pop() || user?.username || "Bác sĩ";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Chào mừng, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
          <CalendarCheck className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long", day: "2-digit", month: "long", year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/medical/patient-mgmt/patient-list">
          <Button variant="outline">
            <UserPlus className="h-4 w-4" />
            Thêm bệnh nhân
          </Button>
        </Link>
        <Link href="/medical/ai-diagnosis/new">
          <Button>
            <Stethoscope className="h-4 w-4" />
            Chẩn đoán mới
          </Button>
        </Link>
      </div>
    </div>
  );
}
