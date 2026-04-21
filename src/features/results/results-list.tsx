"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllVisits } from "@/store/slices/visit-slice";
import { fetchPatients } from "@/store/slices/patient-slice";

import { ResultTable } from "./result-table/result-table";
import { useResultTable } from "@/hooks/use-result-table";

import { History, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { RESULT_COLUMN_LABELS } from "@/constants/results";

export function ResultsList() {
  const dispatch = useAppDispatch();
  const { visits, isLoading } = useAppSelector((state) => state.visit);
  const { patients } = useAppSelector((state) => state.patient);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    if (!isMounted) return;
    
    const visitsPromise = dispatch(fetchAllVisits({ page: pagination.pageIndex + 1, size: pagination.pageSize }));
    const patientsPromise = dispatch(fetchPatients({ page: 1, size: 10 }));
    return () => { visitsPromise.abort(); patientsPromise.abort(); };
  }, [dispatch, isMounted, pagination, dateRange]);

  const { table, globalFilter, setGlobalFilter, columnFilters } = useResultTable({ 
    data: visits, 
    patients,
    pagination,
    onPaginationChange: setPagination
  });

  return (
    <div className="space-y-5 pb-6 w-full">
      <PageHeader
        title="Lịch sử chẩn đoán"
        icon={History}
      />

      <div className="rounded-[24px] bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 flex flex-col overflow-hidden border border-border/40 p-4">
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
      </div>

      <ResultTable 
        table={table} 
        columns={table.getAllColumns()} 
        globalFilter={globalFilter} 
        isLoading={isLoading} 
      />
    </div>
  );
}
