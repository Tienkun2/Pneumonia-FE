"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel, SectionTitle } from "./dashboard-ui";
import { getDiagnosisTranslation } from "@/constants/dashboard";
import { getBadgeClass } from "@/constants/styles";

import { Visit } from "@/types/diagnosis";

interface DashboardActivityProps {
  isLoading: boolean;
  recentVisits: Visit[];
}

export function DashboardActivity({ isLoading, recentVisits }: DashboardActivityProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Panel className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <SectionTitle>Hoạt động mới nhất</SectionTitle>
          <Link href="/medical/ai-diagnosis/history">
            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground transition-all">
              Xem tất cả <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto p-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40">
                {["Bệnh nhân", "Thời gian", "Kết quả chẩn đoán", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-6 py-3 text-xs font-medium text-muted-foreground tracking-wide ${i === 2 ? "text-center" : i === 3 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-3">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </td>
                  </tr>
                ))
                : recentVisits.length > 0
                  ? recentVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium shrink-0">
                            {visit.patientName?.charAt(0) ?? "P"}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-foreground leading-none">
                              {visit.patientName ?? "Ẩn danh"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                              #{visit.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-muted-foreground whitespace-nowrap">
                        <span className="text-foreground font-medium">
                          {new Date(visit.visitDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="mx-2 opacity-40">·</span>
                        {new Date(visit.visitDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={getBadgeClass(visit.diagnosisResult === "NORMAL" ? "success" : "destructive")}>
                          {getDiagnosisTranslation(visit.diagnosisResult ?? "")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/medical/ai-diagnosis/history/${visit.id}?patientId=${visit.patientId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                  : (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">
                        Chưa có hoạt động nào gần đây.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
