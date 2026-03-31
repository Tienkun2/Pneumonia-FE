"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllVisits } from "@/store/slices/visitSlice";
import { fetchPatients } from "@/store/slices/patientSlice";

import { ResultTable } from "./result-table/result-table";
import { useResultTable } from "./result-table/use-result-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  History
} from "lucide-react";

export function ResultsList() {
  const dispatch = useAppDispatch();
  const { visits, isLoading } = useAppSelector((state) => state.visit);
  const { patients } = useAppSelector((state) => state.patient);

  useEffect(() => {
    dispatch(fetchAllVisits({ page: 1, size: 100 }));
    dispatch(fetchPatients({ page: 1, size: 500 })); 
  }, [dispatch]);

  const { table, columns, globalFilter, setGlobalFilter } = useResultTable({
    data: visits,
    patients,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 mt-1 sm:mt-0">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Lịch sử chẩn đoán</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc mã bệnh nhân..."
            className="pl-9 h-9 rounded-lg border-border bg-background shadow-sm"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading && visits.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <ResultTable table={table} columns={columns} globalFilter={globalFilter} />
      )}

      {/* Footer / Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-sm text-muted-foreground">
        <div>
          Tổng cộng: <span className="font-medium text-foreground">{visits.length}</span> lượt khám
        </div>
        
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-foreground">Hiển thị</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-background border-border rounded-lg">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="rounded-xl">
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center font-medium text-foreground">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex rounded-lg border-border text-muted-foreground hover:text-foreground"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang đầu</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 rounded-lg border-border text-muted-foreground hover:text-foreground"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 rounded-lg border-border text-muted-foreground hover:text-foreground"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex rounded-lg border-border text-muted-foreground hover:text-foreground"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang cuối</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
