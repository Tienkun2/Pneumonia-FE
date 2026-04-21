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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <SectionTitle>Hoạt động mới nhất</SectionTitle>
          <Link href="/medical/ai-diagnosis/history">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-primary gap-1 font-medium">
              Tất cả <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Bệnh nhân", "Thời gian", "Kết luận", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-2.5 text-[11px] font-semibold uppercase text-muted-foreground tracking-wide ${i === 2 ? "text-center" : i === 3 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
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
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0 group-hover:bg-primary/15 transition-colors">
                            {visit.patientName?.charAt(0) ?? "P"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground leading-none">
                              {visit.patientName ?? "Ẩn danh"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                              #{visit.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                        <span className="text-foreground font-medium">
                          {new Date(visit.visitDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="mx-1.5 opacity-40">·</span>
                        {new Date(visit.visitDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={getBadgeClass(visit.diagnosisResult === "NORMAL" ? "success" : "destructive")}>
                          {getDiagnosisTranslation(visit.diagnosisResult ?? "")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/medical/ai-diagnosis/history/${visit.id}?patientId=${visit.patientId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
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
