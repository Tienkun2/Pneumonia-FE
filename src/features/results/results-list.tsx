"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllVisits } from "@/store/slices/visitSlice";
import { fetchPatients } from "@/store/slices/patientSlice";

import { ResultTable } from "./result-table/result-table";
import { useResultTable } from "./result-table/use-result-table";

import { Loader2, History, Search, SlidersHorizontal, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";

const RESULT_COLUMN_LABELS = {
  patientCode: "Mã BN",
  patientName: "Họ tên bệnh nhân",
  visitDate: "Ngày khám",
  riskLevel: "Mức độ nguy cơ",
  status: "Trạng thái",
};

export function ResultsList() {
  const dispatch = useAppDispatch();
  const { visits, isLoading } = useAppSelector((state) => state.visit);
  const { patients } = useAppSelector((state) => state.patient);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    const visitsPromise = dispatch(fetchAllVisits({ page: 1, size: 100 }));
    const patientsPromise = dispatch(fetchPatients({ page: 1, size: 500 }));
    return () => { visitsPromise.abort(); patientsPromise.abort(); };
  }, [dispatch, isMounted]);

  const { table, globalFilter, setGlobalFilter } = useResultTable({ data: visits, patients });

  // Quick stats derived from visits
  const highRisk = visits.filter(v => v.diagnoses?.[0]?.result === "PNEUMONIA").length;
  const medRisk = visits.filter(v => v.diagnoses?.[0]?.result === "MEDIUM").length;
  const lowRisk = visits.filter(v => v.diagnoses?.[0]?.result === "NORMAL").length;

  return (
    <div className="space-y-5 pb-6 w-full overflow-x-hidden">
      {/* ── Header ───────────────────────────────────── */}
      <PageHeader
        title="Lịch sử chẩn đoán"
        subtitle={`Tra cứu và quản lý toàn bộ ${visits.length} lượt khám đã được ghi nhận`}
        icon={History}
        stats={[
          { label: "Tổng lượt khám", value: visits.length, color: "text-primary" },
          { label: "Nguy cơ cao", value: highRisk, color: "text-red-500" },
          { label: "Trung bình", value: medRisk, color: "text-amber-500" },
          { label: "Nguy cơ thấp", value: lowRisk, color: "text-emerald-500" },
        ]}
      />

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm theo tên hoặc mã bệnh nhân..."
              className="h-9 w-full rounded-xl border border-border/50 bg-muted/30 pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {globalFilter && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary text-[12px] font-bold px-3 py-1.5 rounded-full">
                <SlidersHorizontal className="h-3 w-3" />
                Tìm: &ldquo;{globalFilter}&rdquo;
              </div>
            )}
            <div className="border-l border-border/40 pl-3">
              <DataTableViewOptions table={table} columnLabels={RESULT_COLUMN_LABELS} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────── */}
      {isLoading && visits.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[13px] font-semibold text-muted-foreground">Đang tải lịch sử chẩn đoán...</p>
        </div>
      ) : visits.length === 0 && !isLoading ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-foreground">Chưa có lịch sử chẩn đoán</p>
            <p className="text-[13px] font-medium text-muted-foreground mt-1">Thực hiện chẩn đoán để xem kết quả ở đây</p>
          </div>
        </div>
      ) : (
        <ResultTable table={table} columns={table.getAllColumns()} globalFilter={globalFilter} />
      )}
    </div>
  );
}
