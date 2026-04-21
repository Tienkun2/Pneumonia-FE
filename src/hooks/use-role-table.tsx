"use client";

import { useMemo } from "react";
import { Role } from "@/types/role";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Settings, MoreVertical } from "lucide-react";
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
import { getBadgeClass } from "@/constants/styles";

interface UseRoleTableProps {
  data: Role[];
  onEdit: (role: Role) => void;
  onPermissionClick: (role: Role) => void;
  onDeleteClick: (roleName: string) => void;
}

export function useRoleTable({ 
  data, 
  onEdit, 
  onPermissionClick, 
  onDeleteClick 
}: Readonly<UseRoleTableProps>) {
  const columns: ColumnDef<Role>[] = useMemo(() => [
    {
      id: "STT",
      header: "STT",
      enableSorting: false,
      cell: ({ row, table }) =>
        table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên vai trò" />,
      cell: ({ row }) => <span className="font-extrabold uppercase tracking-tight">{row.original.name}</span>
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
      cell: ({ row }) => <span className="text-muted-foreground/80 font-medium">{row.original.description || "—"}</span>
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        const status = row.original.status || "ACTIVE";
        return value.includes(status);
      },
      cell: ({ row }) => {
        const status = row.original.status || "ACTIVE";
        const getStatusLabel = () => {
          if (status === "ACTIVE") return "Đang hoạt động";
          if (status === "INACTIVE") return "Ngừng hoạt động";
          return "Chờ kích hoạt";
        };
        const variant = status === "ACTIVE" ? "success" : status === "INACTIVE" ? "destructive" : "warning";
        return (
          <span className={getBadgeClass(variant)}>
            {getStatusLabel()}
          </span>
        );
      },
    },
    {
      id: "userCount",
      header: "Số người dùng",
      cell: () => <span className="font-bold opacity-60">5</span>
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
      filterFn: (row, id, filterValue) => {
        if (!filterValue || !filterValue.from) return true;
        const rowDateStr = row.getValue(id) as string;
        if (!rowDateStr) return false;
        const rowDate = new Date(rowDateStr);
        const from = new Date(filterValue.from);
        from.setHours(0, 0, 0, 0);
        
        if (filterValue.to) {
          const to = new Date(filterValue.to);
          to.setHours(23, 59, 59, 999);
          return rowDate >= from && rowDate <= to;
        }
        
        return rowDate >= from;
      },
      cell: ({ row }) => {
        const dateStr = row.original.createdAt;
        if (!dateStr) return <span className="font-bold opacity-60">03/07/2026</span>; // Fallback if API hasn't been updated yet
        
        try {
          const date = new Date(dateStr);
          return <span className="font-bold opacity-60">{date.toLocaleDateString("vi-VN")}</span>;
        } catch {
          return <span className="font-bold opacity-60">{String(dateStr)}</span>;
        }
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/60 rounded-lg">
                  <span className="sr-only">Mở menu thao tác</span>
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl border-border">
                <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-2 py-2">Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => onPermissionClick(role)} className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Quản lý quyền</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(role)} className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <span>Cập nhật</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteClick(role.name)}
                  className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium focus:bg-destructive/10 focus:text-destructive text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa vai trò</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [onEdit, onPermissionClick, onDeleteClick]);

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
