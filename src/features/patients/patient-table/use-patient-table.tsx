import { useState } from "react";
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
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
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

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
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const translateGender = (gender: string) => {
    switch (gender) {
      case "MALE": return "Nam";
      case "FEMALE": return "Nữ";
      default: return "Khác";
    }
  };

  const columns: ColumnDef<Patient>[] = [
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
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Mở menu thao tác</span>
                  <div className="flex flex-col gap-1 items-center justify-center h-full">
                    <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                    <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                    <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={`/patients/${patient.id}`} className="flex items-center w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Xem chi tiết</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditClick(patient)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Cập nhật</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteClick(patient)} className="cursor-pointer focus:bg-red-50 focus:text-red-600 text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Xoá</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    rowCount,
    pageCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnFilters,
      columnVisibility,
      sorting,
      pagination: pagination || undefined,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: (paginationOrUpdater) => {
      if (onPaginationChange) {
        const nextPagination = typeof paginationOrUpdater === 'function' 
          ? paginationOrUpdater(pagination || { pageIndex: 0, pageSize: 10 }) 
          : paginationOrUpdater;
        onPaginationChange(nextPagination);
      }
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
