"use client";

import { flexRender, Table as ReactTable, ColumnDef } from "@tanstack/react-table";
import { PermissionTreeNode } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface PermissionTableProps {
  readonly table: ReactTable<PermissionTreeNode>;
  readonly columns: ColumnDef<PermissionTreeNode>[];
  readonly globalFilter: string;
}

export function PermissionTable({ table, columns, globalFilter }: PermissionTableProps) {
  return (
    <div className="rounded-[20px] bg-card shadow-sm flex flex-col overflow-hidden border border-border/20">
      {/* Scrollable table body - Exact same scroll logic as User List */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 420px)", minHeight: 200 }}>
        <Table className="min-w-[1000px] border-separate border-spacing-0">
          <TableHeader className="bg-card border-b border-border/40 sticky top-0 z-10 shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[12px] font-extrabold text-muted-foreground uppercase tracking-wider py-3.5 whitespace-nowrap align-middle bg-card first:pl-8"
                  >
                    {header.isPlaceholder ? null : (
                      <div className={`flex items-center ${header.id === "actions" ? "justify-end pr-4" : (header.id === "STT" || ["view", "create", "update", "delete", "status"].includes(header.id)) ? "justify-center" : "justify-start"}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`py-3.5 text-[13px] text-foreground/90 font-semibold align-middle whitespace-nowrap first:pl-8 ${cell.column.id === "STT" && "text-center"}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-[13px] font-semibold text-muted-foreground">
                  {globalFilter ? "Không tìm thấy chức năng nào phù hợp." : "Vui lòng chọn hoặc tìm kiếm chức năng."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Exact same styling as User List */}
      <div className="border-t border-border/30 bg-card px-5 py-3.5">
        <DataTablePagination table={table} itemName="chức năng" />
      </div>
    </div>
  );
}
