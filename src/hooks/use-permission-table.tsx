"use client";

import { useMemo } from "react";
import { PermissionTreeNode } from "@/types/permission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronRight, MoreVertical } from "lucide-react";
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

interface UsePermissionTableProps {
  data: PermissionTreeNode[];
  currentLevel: number;
  onNavigateDown: (permission: PermissionTreeNode) => void;
  onDeleteClick: (permissionName: string) => void;
}

export function usePermissionTable({ 
  data, 
  currentLevel,
  onNavigateDown, 
  onDeleteClick 
}: Readonly<UsePermissionTableProps>) {
  const columns: ColumnDef<PermissionTreeNode>[] = useMemo(() => [
    {
      id: "STT",
      header: "STT",
      enableSorting: false,
      cell: ({ row, table }) =>
        table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên chức năng" />,
      cell: ({ row }) => <span className="font-extrabold text-foreground">{row.original.name}</span>
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả nghiệp vụ" />,
      cell: ({ row }) => <span className="text-muted-foreground font-medium">{row.original.description || "—"}</span>
    },
    {
      id: "level",
      header: "Cấp độ",
      cell: () => <span className="font-bold text-primary">Cấp {currentLevel}</span>
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
      filterFn: (row, id, filterValue) => {
        if (!filterValue?.from) return true;
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
        if (!dateStr) return <span className="font-bold opacity-60">04/11/2025</span>;
        
        try {
          const date = new Date(dateStr);
          return <span className="font-bold opacity-60">{date.toLocaleDateString("vi-VN")}</span>;
        } catch {
          return <span className="font-bold opacity-60">{String(dateStr)}</span>;
        }
      }
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        const status = row.original.status || "active";
        return value.includes(status);
      },
      cell: ({ row }) => {
        const status = row.original.status || "active";
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none font-bold text-[11px] rounded-full">
            {status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const permission = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
             {currentLevel < 3 && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all p-0"
                    onClick={() => onNavigateDown(permission)}
                    title="Xem quyền con"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
            <div className="w-px h-4 bg-border/40 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 opacity-40 hover:opacity-100 hover:bg-muted/60 rounded-lg transition-all">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl border-border w-[180px]">
                <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest px-2 py-2">Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteClick(permission.name)}
                  className="cursor-pointer rounded-lg gap-2.5 py-2.5 font-bold text-[13px] text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa quyền</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [currentLevel, onNavigateDown, onDeleteClick]);

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
