"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllVisits } from "@/store/slices/visitSlice";
import { fetchPatients } from "@/store/slices/patientSlice";

import { ResultTable } from "./result-table/result-table";
import { useResultTable } from "./result-table/use-result-table";

import { Loader2, History } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const visitsPromise = dispatch(fetchAllVisits({ page: 1, size: 100 }));
    const patientsPromise = dispatch(fetchPatients({ page: 1, size: 500 }));

    return () => {
      visitsPromise.abort();
      patientsPromise.abort();
    };
  }, [dispatch, isMounted]);

  const { table, globalFilter, setGlobalFilter } = useResultTable({
    data: visits,
    patients,
  });

  return (
    <div className="space-y-6 px-2 pb-4 w-full overflow-x-hidden">
      <PageHeader
        title="Lịch sử chẩn đoán"
        icon={History}
      />

      <TableToolbar
        placeholder="Tìm theo tên hoặc mã bệnh nhân..."
        value={globalFilter}
        onChange={setGlobalFilter}
      >
        <div className="ml-auto">
          <DataTableViewOptions
            table={table}
            columnLabels={RESULT_COLUMN_LABELS}
          />
        </div>
      </TableToolbar>

      {isLoading && visits.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <ResultTable table={table} columns={table.getAllColumns()} globalFilter={globalFilter} />
          <DataTablePagination table={table} itemName="lượt khám" />
        </>
      )}
    </div>
  );
}
