"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

interface useDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  rowCount?: number;
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  manualPagination?: boolean;
}

export function useDataTable<TData>({
  data,
  columns,
  rowCount,
  pageCount,
  pagination,
  onPaginationChange,
  manualPagination = false,
}: useDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    rowCount,
    pageCount,
    manualPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    state: {
      globalFilter,
      columnFilters,
      columnVisibility,
      sorting,
      ...(pagination ? { pagination } : {}),
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
        if (onPaginationChange) {
            const nextPagination = typeof updater === 'function' ? updater(pagination || { pageIndex: 0, pageSize: 10 }) : updater;
            onPaginationChange(nextPagination);
        }
    },
    initialState: {
        pagination: {
            pageSize: 10,
        }
    }
  });

  return {
    table,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    sorting,
    setSorting,
  };
}
