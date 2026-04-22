import { useMemo } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Settings2, MoreVertical, LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
} from "@tanstack/react-table";

import { USER_STATUS } from "@/constants/user";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";
import { getBadgeClass } from "@/constants/styles";

interface UseManagementUserTableProps {
  data: User[];
  onSelectUser: (user: User) => void;
  countField: "deviceCount" | "sessionCount";
  countLabel: string;
  countIcon: LucideIcon;
  actionLabel: string;
}

export function useManagementUserTable({ 
  data, 
  onSelectUser,
  countField,
  countLabel,
  countIcon: CountIcon,
  actionLabel
}: UseManagementUserTableProps) {
  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      id: "STT",
      header: "STT",
      enableSorting: false,
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "displayName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên hiển thị" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] border border-primary/10 uppercase">
            {String(row.original.displayName || "?").charAt(0)}
          </div>
          <span className="font-bold">{row.original.displayName || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <span className="text-muted-foreground font-medium">{row.original.email || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const isActive = row.original.status === USER_STATUS.ACTIVE;
        return (
          <span className={getBadgeClass(isActive ? "success" : "warning")}>
            {isActive ? "Đang hoạt động" : "Chờ kích hoạt"}
          </span>
        );
      },
    },
    {
      accessorKey: countField,
      header: ({ column }) => <DataTableColumnHeader column={column} title={countLabel} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CountIcon className="h-4 w-4 text-primary opacity-40" />
          <span className="font-black text-primary">{row.original[countField] || 0}</span>
        </div>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors focus-visible:ring-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1 shadow-lg border-border/50 bg-card/95 backdrop-blur-md">
              <DropdownMenuItem 
                onClick={() => onSelectUser(row.original)}
                className="flex items-center gap-2 cursor-pointer rounded-lg text-[12px] font-bold py-2 focus:bg-primary/10 focus:text-primary transition-colors"
              >
                <Settings2 className="h-3.5 w-3.5" />
                {actionLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], [onSelectUser, countField, countLabel, CountIcon, actionLabel]);

  const dataTable = useDataTable({
    data,
    columns,
  });

  return {
    ...dataTable,
    columns,
  };
}
