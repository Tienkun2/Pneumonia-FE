"use client";

import { useMemo } from "react";
import { PermissionTreeNode } from "@/types/permission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  ColumnDef,
} from "@tanstack/react-table";

import { useDataTable } from "@/hooks/use-data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface UsePermissionTableProps {
  data: PermissionTreeNode[];
  onToggle: (name: string, checked: boolean) => void;
}

export function usePermissionTable({ 
  data, 
  onToggle,
}: Readonly<UsePermissionTableProps>) {
  const columns: ColumnDef<PermissionTreeNode>[] = useMemo(() => [
    {
      id: "STT",
      header: "STT",
      enableSorting: false,
      cell: ({ row, table }) =>
        <span className="text-center block font-black text-muted-foreground/20 text-[12px]">
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1}
        </span>,
    },
    {
      accessorKey: "description",
      header: "Chức năng chi tiết",
      cell: ({ row }) => {
          const node = row.original;
          return (
            <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-black text-foreground uppercase tracking-tight leading-none">{node.description || node.name}</span>
                <span className="text-[10px] font-bold text-muted-foreground/30 tracking-wider ">{node.name}</span>
            </div>
          );
      }
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: () => (
        <Badge className="bg-[#e6f4ea] text-[#34a853] hover:bg-[#e6f4ea] border-none font-bold text-[10px] px-3 py-1 rounded-full shadow-sm">
          Đang hoạt động
        </Badge>
      ),
    },
    {
      id: "view",
      header: "Xem",
      cell: ({ row }) => <MatrixCheckbox node={row.original} onToggle={onToggle} suffix={["_READ", "_LIST", "_VIEW"]} />,
    },
    {
      id: "create",
      header: "Thêm",
      cell: ({ row }) => <MatrixCheckbox node={row.original} onToggle={onToggle} suffix={["_CREATE", "_ADD"]} />,
    },
    {
      id: "update",
      header: "Sửa",
      cell: ({ row }) => <MatrixCheckbox node={row.original} onToggle={onToggle} suffix={["_UPDATE", "_EDIT"]} />,
    },
    {
      id: "delete",
      header: "Xóa",
      cell: ({ row }) => <MatrixCheckbox node={row.original} onToggle={onToggle} suffix={["_DELETE", "_REMOVE"]} />,
    },
    {
      id: "actions",
      header: "",
      cell: () => (
          <div className="text-right pr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-10 hover:opacity-100 hover:bg-muted/60 transition-all">
              <MoreVertical className="h-4 w-4 text-muted-foreground/60" />
            </Button>
          </div>
      ),
    },
  ], [onToggle]);

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

function MatrixCheckbox({ node, onToggle, suffix }: { node: PermissionTreeNode; onToggle: (n: string, c: boolean) => void; suffix: string[] }) {
    const perm = node.children?.find(c => suffix.some(s => c.name.endsWith(s)));
    
    // If no specific suffix permission exists, we only show for the "VIEW" column (mapped to the node itself if it's a leaf node/has no children)
    if (!perm && suffix[0] !== "_READ") return null;
    
    const targetNode = perm || node;
    const isChecked = targetNode.isChecked;

    return (
        <div className="flex justify-center">
            <Checkbox 
                checked={isChecked} 
                onCheckedChange={(val) => onToggle(targetNode.name, !!val)}
                className={cn(
                    "h-6 w-6 rounded-full border-none transition-all duration-200", 
                    isChecked 
                        ? "bg-[#34a853] shadow-md shadow-emerald-500/20" 
                        : "bg-[#f1f3f5] hover:bg-[#e9ecef]"
                )} 
            />
        </div>
    );
}
