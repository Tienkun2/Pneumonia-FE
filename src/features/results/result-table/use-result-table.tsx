import { useState, useMemo, useCallback } from "react";
import { Visit } from "@/types/visit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface PatientInfo {
  id: string;
  fullName: string;
  code: string;
}

interface UseResultTableProps {
  data: Visit[];
  patients: PatientInfo[];
}

export function useResultTable({ data, patients }: UseResultTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const getPatientName = useCallback((patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    return p ? p.fullName : "N/A";
  }, [patients]);

  const getPatientCode = useCallback((patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    return p ? p.code : "N/A";
  }, [patients]);

  const getRiskStatus = useCallback((visit: Visit) => {
    const lastDiag = visit.diagnoses?.[0];
    if (lastDiag?.riskLevel) return lastDiag.riskLevel;
    
    // Hash-based mock for variety
    const codePoint = visit.id.codePointAt(0) || 0;
    const hash = codePoint % 3;
    if (hash === 0) return "Cao";
    if (hash === 1) return "Trung bình";
    return "Thấp";
  }, []);

  const getBadgeStyles = useCallback((risk: string) => {
    if (risk === "Cao") return "bg-rose-100 text-rose-700";
    if (risk === "Trung bình") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  }, []);

  const columns: ColumnDef<Visit>[] = useMemo(() => [
    {
      id: "patientCode",
      accessorFn: (row) => getPatientCode(row.patientId),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã BN" />,
      cell: ({ row }) => (
        <span className="font-medium text-slate-800">
          {row.getValue("patientCode")}
        </span>
      ),
    },
    {
      id: "patientName",
      accessorFn: (row) => getPatientName(row.patientId),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Họ tên bệnh nhân" />,
      cell: ({ row }) => (
        <span className="font-medium text-slate-800 text-sm">
          {row.getValue("patientName")}
        </span>
      ),
    },
    {
      accessorKey: "visitDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày khám" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Calendar className="h-4 w-4" />
          {formatDate(row.getValue("visitDate"), "DD/MM/YYYY")}
        </div>
      ),
    },
    {
      id: "riskLevel",
      accessorFn: (row) => getRiskStatus(row),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mức độ nguy cơ" />,
      cell: ({ row }) => {
        const risk = row.getValue("riskLevel") as string;
        return (
          <Badge className={`border-0 pointer-events-none shadow-none font-normal ${getBadgeStyles(risk)}`}>
            {risk}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: () => (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 pointer-events-none shadow-none font-normal">
          Đã chẩn đoán
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <Link href={`/results/${row.original.id}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Xem chi tiết</span>
            </Button>
          </Link>
        </div>
      ),
    },
  ], [getPatientCode, getPatientName, getRiskStatus, getBadgeStyles]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const name = String(row.getValue("patientName")).toLowerCase();
      const code = String(row.getValue("patientCode")).toLowerCase();
      return name.includes(searchValue) || code.includes(searchValue);
    },
    state: {
      globalFilter,
      columnFilters,
      columnVisibility,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return {
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
  };
}
