"use client";

import { useMemo } from "react";
import { Role } from "@/types/role";
import { Badge } from "@/components/ui/badge";
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
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0 pointer-events-none shadow-none font-bold px-3 py-1 rounded-full text-[11px]">
            {getStatusLabel()}
          </Badge>
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
                <Button variant="ghost" className="h-8 w-8 p-0 opacity-40 hover:opacity-100 hover:bg-muted/60 rounded-lg transition-all">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl border-border w-[180px]">
                <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-2 py-2">Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => onPermissionClick(role)} className="cursor-pointer rounded-lg gap-2.5 py-2.5 font-bold text-[13px] text-muted-foreground hover:text-primary">
                  <Settings className="h-4 w-4 opacity-70" />
                  <span>Quản lý quyền</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(role)} className="cursor-pointer rounded-lg gap-2.5 py-2.5 font-bold text-[13px] text-muted-foreground hover:text-blue-600">
                  <Edit className="h-4 w-4 opacity-70" />
                  <span>Cập nhật</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteClick(role.name)}
                  className="cursor-pointer rounded-lg gap-2.5 py-2.5 font-bold text-[13px] text-destructive focus:bg-destructive/10 focus:text-destructive"
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
