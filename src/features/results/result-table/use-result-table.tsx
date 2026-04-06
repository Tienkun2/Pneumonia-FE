import { useMemo, useCallback } from "react";
import { Visit } from "@/types/visit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";
import {
  ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";

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
    if (lastDiag?.result) {
      if (lastDiag.result === "PNEUMONIA") return "Cao";
      if (lastDiag.result === "NORMAL") return "Thấp";
      return lastDiag.result;
    }
    return "Thấp";
  }, []);

  const getBadgeStyles = useCallback((risk: string) => {
    const riskLower = risk.toLowerCase();
    if (riskLower === "cao" || riskLower === "high") return "bg-red-500/10 text-red-500 border-red-500/20";
    if (riskLower === "trung bình" || riskLower === "medium") return "bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold";
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold";
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
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 pointer-events-none shadow-none font-bold text-[11px] px-3 py-1">
          Đã chẩn đoán
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <Link href={`/results/${row.original.id}?patientId=${row.original.patientId}`}>
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
  ], [getPatientCode, getPatientName, getRiskStatus, getBadgeStyles]);

  const { table, globalFilter, setGlobalFilter, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = useDataTable({
    data,
    columns,
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
