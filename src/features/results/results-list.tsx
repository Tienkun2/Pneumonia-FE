"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllVisits } from "@/store/slices/visit-slice";
import { fetchPatients } from "@/store/slices/patient-slice";

import { ResultTable } from "./result-table/result-table";
import { useResultTable } from "./result-table/use-result-table";

import { Loader2, History, Search, SlidersHorizontal, FileText, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";

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

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 });

  useEffect(() => {
    if (!isMounted) return;
    
    const visitsPromise = dispatch(fetchAllVisits({ page: pagination.pageIndex + 1, size: pagination.pageSize }));
    const patientsPromise = dispatch(fetchPatients({ page: 1, size: 100 }));
    return () => { visitsPromise.abort(); patientsPromise.abort(); };
  }, [dispatch, isMounted, pagination, dateRange]);

  const { table, globalFilter, setGlobalFilter, columnFilters } = useResultTable({ 
    data: visits, 
    patients,
    pagination,
    onPaginationChange: setPagination
  });

  const highRisk = visits.filter(v => v.diagnosisResult === "Cao").length;
  const lowRisk = visits.filter(v => v.diagnosisResult === "Thấp").length;

  return (
    <div className="space-y-5 pb-6 w-full">
      {/* ── Header ───────────────────────────────────── */}
      <PageHeader
        title="Lịch sử chẩn đoán"
        subtitle={`Tra cứu và quản lý toàn bộ ${visits.length} lượt khám đã được ghi nhận`}
        icon={History}
        stats={[
          { label: "Tổng lượt khám", value: visits.length, color: "text-primary" },
          { label: "Nguy cơ cao", value: highRisk, color: "text-red-500" },
          { label: "Nguy cơ thấp", value: lowRisk, color: "text-emerald-500" },
        ]}
      />

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="rounded-[20px] bg-card shadow-sm flex flex-col overflow-hidden border border-border/20 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none opacity-50" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm mã BN, họ tên, SĐT..."
              className="h-9 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all shadow-sm"
            />
          </div>

          {table.getColumn("riskLevel") && (
            <DataTableFacetedFilter
              column={table.getColumn("riskLevel")}
              title="Nguy cơ"
              options={[
                { label: "Cao", value: "Cao" },
                { label: "Trung bình", value: "Trung bình" },
                { label: "Thấp", value: "Thấp" },
              ]}
            />
          )}

          <DataTableDateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Ngày khám"
          />

          <div className="ml-auto flex items-center gap-2">
            {(globalFilter || columnFilters.length > 0 || dateRange) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  table.resetColumnFilters();
                  setGlobalFilter("");
                  setDateRange(undefined);
                }}
                className="h-9 px-3 text-[13px] font-semibold text-muted-foreground rounded-xl hover:bg-muted/50"
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Đặt lại
              </Button>
            )}
            <div className="border-l border-border/40 pl-3">
              <DataTableViewOptions table={table} columnLabels={RESULT_COLUMN_LABELS} />
            </div>
          </div>
        </div>

        {/* Active filter indicator */}
        {(globalFilter || columnFilters.length > 0 || dateRange) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-primary">Đang lọc dữ liệu</span>
            {globalFilter && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                Tìm kiếm: &ldquo;{globalFilter}&rdquo;
              </span>
            )}
          </div>
        )}
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
