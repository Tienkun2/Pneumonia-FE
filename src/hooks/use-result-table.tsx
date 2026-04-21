import { useMemo, useCallback } from "react";
import { Visit } from "@/types/diagnosis";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";
import {
  ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";
import { getBadgeClass } from "@/constants/styles";
import { getDiagnosisTranslation } from "@/constants/dashboard";

interface PatientInfo {
  id: string;
  fullName: string;
  code: string;
}

interface UseResultTableProps {
  data: Visit[];
  patients: PatientInfo[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function useResultTable({ 
  data, 
  patients,
  pagination,
  onPaginationChange
}: UseResultTableProps) {
  const getPatientName = useCallback((patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    return p ? p.fullName : "N/A";
  }, [patients]);

  const getPatientCode = useCallback((patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    return p ? p.code : "N/A";
  }, [patients]);

  const getRiskStatus = useCallback((visit: Visit) => {
    return visit.diagnosisResult || "Thấp";
  }, []);


  const columns: ColumnDef<Visit>[] = useMemo(() => [
    {
      id: "patientCode",
      accessorFn: (row) => getPatientCode(row.patientId),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã BN" />,
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {row.getValue("patientCode")}
        </span>
      ),
    },
    {
      id: "patientName",
      accessorFn: (row) => getPatientName(row.patientId),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Họ tên bệnh nhân" />,
      cell: ({ row }) => (
        <span className="font-bold text-foreground text-[13px]">
          {row.getValue("patientName")}
        </span>
      ),
    },
    {
      accessorKey: "visitDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày khám" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground text-[13px] font-semibold">
          <Calendar className="h-4 w-4" />
          {formatDate(row.getValue("visitDate"), "HH:mm:ss DD/MM/YYYY")}
        </div>
      ),
    },
    {
      id: "riskLevel",
      accessorFn: (row) => getRiskStatus(row),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mức độ nguy cơ" />,
      cell: ({ row }) => {
        const risk = (row.getValue("riskLevel") as string).toUpperCase();
        const variant = risk === "NORMAL" || risk === "THẤP" ? "success" : risk === "TRUNG BÌNH" ? "warning" : "destructive";
        return (
          <span className={getBadgeClass(variant)}>
            {getDiagnosisTranslation(risk)}
          </span>
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
        <span className={getBadgeClass("info")}>
          Đã chẩn đoán
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <Link href={`/medical/ai-diagnosis/history/${row.original.id}?patientId=${row.original.patientId}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Xem chi tiết</span>
            </Button>
          </Link>
        </div>
      ),
    },
  ], [getPatientCode, getPatientName, getRiskStatus]);

  const { table, globalFilter, setGlobalFilter, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = useDataTable({
    data,
    columns,
    pagination,
    onPaginationChange,
    manualPagination: true,
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
