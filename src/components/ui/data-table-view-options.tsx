"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  readonly table: Table<TData>;
  readonly columnLabels?: Record<string, string>;
}

export function DataTableViewOptions<TData>({
  table,
  columnLabels = {},
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
            variant="outline"
            size="sm"
            className={cn(
                "h-9 shrink-0 gap-2 text-[13px] font-bold border-border/50 bg-card shadow-sm rounded-xl transition-all"
            )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Hiển thị cột
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-border/60 p-1 animate-in fade-in zoom-in duration-200">
        <DropdownMenuLabel className="font-semibold text-[13px] text-muted-foreground px-3 py-2">Cột hiển thị</DropdownMenuLabel>
        <DropdownMenuSeparator className="opacity-40" />
        <div className="space-y-0.5 p-1">
            {table
            .getAllColumns()
            .filter(
                (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => {
                return (
                <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize rounded-lg font-bold text-[13px] text-foreground cursor-pointer py-2 focus:bg-primary/5 focus:text-primary"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    onSelect={(e) => e.preventDefault()}
                >
                    {columnLabels[column.id] || column.id}
                </DropdownMenuCheckboxItem>
                );
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
