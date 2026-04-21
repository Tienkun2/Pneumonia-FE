import { useMemo } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Settings, Power, MoreVertical } from "lucide-react";
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

import { USER_STATUS } from "@/constants/user";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";
import { getBadgeClass } from "@/constants/styles";

interface UseUserTableProps {
  data: User[];
  rowCount?: number;
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onEdit: (user: User) => void;
  onRoleClick: (user: User) => void;
  onToggleStatusClick: (user: User) => void;
  onDeleteClick: (id: string, username: string) => void;
}

export function useUserTable({ 
  data, 
  rowCount,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit, 
  onRoleClick, 
  onToggleStatusClick, 
  onDeleteClick 
}: UseUserTableProps) {
  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      id: "STT",
      header: "STT",
      enableSorting: false,
      cell: ({ row, table }) =>
        table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1,
    },
    {
      accessorKey: "username",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên đăng nhập" />,
    },
    {
      accessorKey: "displayName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên hiển thị" />,
      cell: ({ row }) => row.original.displayName || "-",
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Số điện thoại" />,
      cell: ({ row }) => row.original.phoneNumber || "-",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        
        const status = row.original.status || USER_STATUS.PENDING;
        return value.includes(status);
      },
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === USER_STATUS.ACTIVE) {
          return <span className={getBadgeClass("success")}>Đang hoạt động</span>;
        }
        if (status === USER_STATUS.INACTIVE) {
          return <span className={getBadgeClass("destructive")}>Ngừng hoạt động</span>;
        }
        return <span className={getBadgeClass("warning")}>Chờ kích hoạt</span>;
      },
    },
    {
      accessorKey: "roles",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        const roles = row.original.roles || [];
        return roles.some(r => value.includes(r.name));
      },
      cell: ({ row }) => {
        const roles = row.original.roles;
        if (!roles || roles.length === 0) return <span>Chưa cập nhật</span>;
        const roleNames = roles.map(r => r.name).join(", ");
        return <span>{roleNames}</span>;
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      accessorFn: (row) => row.createdAt || (row as unknown as { createdDate: string }).createdDate,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
      filterFn: (row, id, filterValue) => {
        if (!filterValue || !Array.isArray(filterValue) || filterValue.length < 2) return true;
        const [start, end] = filterValue;
        const rowDateStr = row.getValue(id) as string;
        if (!rowDateStr) return false;
        const rowDate = new Date(rowDateStr);
        return rowDate >= start && rowDate <= end;
      },
      cell: ({ row }) => {
        const dateStr = row.original.createdAt || (row.original as unknown as { createdDate: string }).createdDate;
        if (!dateStr) return "-";
        
        try {
          const date = new Date(dateStr);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          return `${yyyy}/${mm}/${dd}`;
        } catch {
          return String(dateStr);
        }
      },
      sortDescFirst: true,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
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
                 <DropdownMenuItem onClick={() => onRoleClick(user)} className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Sửa vai trò</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(user)} className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <span>Cập nhật</span>
                </DropdownMenuItem>
                {user.status !== USER_STATUS.PENDING && (
                  <DropdownMenuItem onClick={() => onToggleStatusClick(user)} className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium">
                    <Power className="h-4 w-4 text-muted-foreground" />
                    <span>{user.status === USER_STATUS.ACTIVE ? "Khóa tài khoản" : "Kích hoạt tài khoản"}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDeleteClick(user.id, user.username)}
                  className="cursor-pointer rounded-lg gap-2 py-2.5 font-medium focus:bg-destructive/10 focus:text-destructive text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa tài khoản</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [onEdit, onRoleClick, onToggleStatusClick, onDeleteClick]);

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
