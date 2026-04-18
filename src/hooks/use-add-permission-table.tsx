"use client";

import { useMemo } from "react";
import { PermissionTreeNode } from "@/types/permission";
import {
  ColumnDef,
} from "@tanstack/react-table";

import { useDataTable } from "@/hooks/use-data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface UseAddPermissionTableProps {
  data: PermissionTreeNode[];
  onToggle: (name: string, checked: boolean) => void;
}

export function useAddPermissionTable({
  data,
  onToggle,
}: Readonly<UseAddPermissionTableProps>) {
  const columns: ColumnDef<PermissionTreeNode>[] = useMemo(() => [
    {
      accessorKey: "description",
      header: () => <div className="text-left font-bold text-foreground">Chức năng</div>,
      cell: ({ row }) => {
        const node = row.original;
        return (
          <div className="flex flex-col py-1">
            <span className="text-[14px] font-bold text-foreground leading-tight">{node.description || node.name}</span>
            <span className="text-[12px] text-muted-foreground/60">Cấp: 3</span>
          </div>
        );
      }
    },
    {
      id: "create",
      header: () => <div className="text-center font-bold text-foreground">Tạo</div>,
      cell: ({ row }) => <CircularCheckbox node={row.original} onToggle={onToggle} suffix={["_CREATE", "_ADD"]} />,
    },
    {
      id: "view",
      header: () => <div className="text-center font-bold text-foreground">Xem</div>,
      cell: ({ row }) => <CircularCheckbox node={row.original} onToggle={onToggle} suffix={["_READ", "_LIST", "_VIEW"]} />,
    },
    {
      id: "update",
      header: () => <div className="text-center font-bold text-foreground">Sửa</div>,
      cell: ({ row }) => <CircularCheckbox node={row.original} onToggle={onToggle} suffix={["_UPDATE", "_EDIT"]} />,
    },
    {
      id: "delete",
      header: () => <div className="text-center font-bold text-foreground">Xóa</div>,
      cell: ({ row }) => <CircularCheckbox node={row.original} onToggle={onToggle} suffix={["_DELETE", "_REMOVE"]} />,
    },
    {
      id: "assign",
      header: () => <div className="text-center font-bold text-foreground">Chọn</div>,
      cell: ({ row }) => {
        const node = row.original;
        // Logic: functionally gán is mapped to the functional group (node itself)
        return (
          <div className="flex justify-center">
            <Switch 
               checked={node.isChecked}
               onCheckedChange={(val) => onToggle(node.name, !!val)}
               className="data-[state=checked]:bg-[#2563eb]"
            />
          </div>
        );
      },
    },
  ], [onToggle]);

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data,
    columns,
  });

  return {
    table,
    columns,
    globalFilter,
    setGlobalFilter,
  };
}

function CircularCheckbox({ node, onToggle, suffix }: { node: PermissionTreeNode; onToggle: (n: string, c: boolean) => void; suffix: string[] }) {
  const perm = node.children?.find(c => suffix.some(s => c.name.endsWith(s)));
  
  // Only show checkboxes for permissions that exist in the children list
  if (!perm) return null;

  const isChecked = perm.isChecked;

  return (
    <div className="flex justify-center">
      <Checkbox
        checked={isChecked}
        onCheckedChange={(val) => onToggle(perm.name, !!val)}
        className={cn(
          "h-6 w-6 rounded-full border-2 border-border/60 transition-all duration-200",
          isChecked
            ? "bg-primary border-primary"
            : "bg-background hover:bg-muted"
        )}
      />
    </div>
  );
}
