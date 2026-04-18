"use client";

import { flexRender, Table as ReactTable, ColumnDef } from "@tanstack/react-table";
import { Role } from "@/types/role";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RoleTableProps {
  readonly table: ReactTable<Role>;
  readonly columns: ColumnDef<Role>[];
  readonly globalFilter: string;
  readonly isLoading?: boolean;
}

export function RoleTable({ table, columns, globalFilter, isLoading }: RoleTableProps) {
  const hasRows = table.getRowModel().rows?.length > 0;
  return (
    <div className="rounded-[24px] bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 flex flex-col overflow-hidden border border-border/40 relative">
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <Progress value={undefined} className="h-0.5 rounded-none bg-transparent [&>div]:bg-primary" />
        </div>
      )}

      {/* Scrollable table body - Exact same scroll logic as User List */}
      <div className={cn("overflow-x-auto overflow-y-auto transition-all duration-300", isLoading && hasRows ? "opacity-50 pointer-events-none blur-[0.5px]" : "opacity-100")} style={{ maxHeight: "calc(100vh - 340px)", minHeight: 400 }}>
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
                      <div className={`flex items-center ${header.id === "actions" ? "justify-end pr-4" : (header.id === "STT" || ["status", "userCount"].includes(header.id)) ? "justify-center" : "justify-start"}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && !hasRows ? (
                Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={`skeleton-row-${i}`} className="h-16 border-b border-border/30 last:border-0 hover:bg-transparent px-8">
                        {columns.map((col, j) => (
                            <TableCell key={`skeleton-cell-${i}-${j}`} className="py-4 first:pl-8">
                                <Skeleton className="h-4 w-full opacity-20 rounded-md" />
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : (
                <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0 animate-in fade-in duration-500"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={`py-3.5 text-[13px] text-foreground/90 font-semibold align-middle whitespace-nowrap first:pl-8 ${cell.column.id === "STT" && "text-center opacity-40"}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center text-[13px] font-semibold text-muted-foreground">
                      {globalFilter ? "Không tìm thấy vai trò nào phù hợp." : "Chưa có dữ liệu vai trò."}
                    </TableCell>
                  </TableRow>
                )}
                </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Exact same styling as User List */}
      <div className="border-t border-border/30 bg-card px-5 py-3.5">
        <DataTablePagination table={table} itemName="vai trò" />
      </div>
    </div>
  );
}
