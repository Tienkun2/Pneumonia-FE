"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { flexRender, Table as TableType, ColumnDef } from "@tanstack/react-table";
import { Inbox } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface ManagementUserTableProps<TData> {
  table: TableType<TData>;
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
}

export function ManagementUserTable<TData>({
  table,
  columns,
  isLoading,
}: ManagementUserTableProps<TData>) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-6 text-left align-middle text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </TableRow>
            ))}
          </thead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent border-b border-border/30 last:border-0">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-6 py-4">
                      <Skeleton className="h-4 w-full rounded-md bg-muted/40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group hover:bg-primary/[0.02] transition-colors border-b border-border/30 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Inbox className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm font-bold text-muted-foreground/40 italic">Không có dữ liệu người dùng nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
