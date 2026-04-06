import { useMemo, useCallback } from "react";
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";

interface UsePatientTableProps {
  data: Patient[];
  rowCount?: number;
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onEditClick: (patient: Patient) => void;
  onDeleteClick: (patient: Patient) => void;
}

export function usePatientTable({
  data,
  rowCount,
  pageCount,
  pagination,
  onPaginationChange,
  onEditClick,
  onDeleteClick,
}: UsePatientTableProps) {
  const calculateAge = useCallback((dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }, []);

  const translateGender = useCallback((gender: string) => {
    switch (gender) {
      case "MALE": return "Nam";
      case "FEMALE": return "Nữ";
      default: return "Khác";
    }
  }, []);

  const columns: ColumnDef<Patient>[] = useMemo(() => [
    {
      id: "STT",
      header: "STT",
      enableSorting: false,
      cell: ({ row, table }) =>
        table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1,
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã BN" />,
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Họ tên" />,
      cell: ({ row }) => row.original.fullName || "-",
    },
    {
      id: "age",
      accessorFn: (row) => row.dateOfBirth,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tuổi" />,
      cell: ({ row }) => calculateAge(row.original.dateOfBirth),
    },
    {
      accessorKey: "gender",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Giới tính" />,
      cell: ({ row }) => translateGender(row.original.gender),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Số điện thoại" />,
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Địa chỉ" />,
      cell: ({ row }) => row.original.address || "-",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                  <span className="sr-only">Mở menu thao tác</span>
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl border-border">
                <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-2 py-2">Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium" asChild>
                  <Link href={`/patients/${patient.id}`} className="flex items-center w-full">
                    <Eye className="h-4 w-4 text-slate-400" />
                    <span>Xem chi tiết</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditClick(patient)} className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium">
                  <Edit className="h-4 w-4 text-slate-400" />
                  <span>Cập nhật</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteClick(patient)} className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium focus:bg-red-50 focus:text-red-700 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  <span>Xoá hồ sơ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [calculateAge, translateGender, onDeleteClick, onEditClick]);

  const { table, globalFilter, setGlobalFilter, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = useDataTable({
    data,
    columns,
    rowCount,
    pageCount,
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
