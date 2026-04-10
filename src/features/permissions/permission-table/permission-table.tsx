import { flexRender, Table as ReactTable, ColumnDef } from "@tanstack/react-table";
import { PermissionTreeNode } from "@/types/user";
import { cn } from "@/lib/utils";
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

interface PermissionTableProps {
  readonly table: ReactTable<PermissionTreeNode>;
  readonly columns: ColumnDef<PermissionTreeNode>[];
  readonly globalFilter: string;
  readonly isLoading?: boolean;
}

export function PermissionTable({ table, columns, globalFilter, isLoading }: PermissionTableProps) {
  const hasRows = table.getRowModel().rows?.length > 0;
  return (
    <div className="rounded-[20px] bg-card border border-border/20 shadow-sm flex flex-col overflow-hidden relative">
      {/* Loading bar at the top of the table component */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <Progress value={undefined} className="h-0.5 rounded-none bg-transparent [&>div]:bg-primary" />
        </div>
      )}
      <div className={cn("overflow-x-auto overflow-y-auto transition-opacity duration-300", isLoading && hasRows ? "opacity-60 pointer-events-none" : "opacity-100")} style={{ maxHeight: "calc(100vh - 400px)", minHeight: 400 }}>
        <Table className="min-w-[1000px] border-separate border-spacing-0">
          <TableHeader className="bg-card border-b border-border/40 sticky top-0 z-10 shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[12px] font-bold text-foreground h-11 whitespace-nowrap align-middle"
                  >
                    {header.isPlaceholder ? null : (
                      <div className={`flex items-center ${header.id === "actions" ? "justify-end pr-6" : "justify-start"}`}>
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
                Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`skeleton-row-${i}`} className="h-14 border-b border-border/50 last:border-0">
                        {columns.map((col, j) => (
                            <TableCell key={`skeleton-cell-${i}-${String(col.header || j)}`} className="py-2">
                                <Skeleton className="h-4 w-full opacity-10" />
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
                      className="group transition-colors hover:bg-muted/5 h-14 border-b border-border/50 last:border-0 animate-in fade-in duration-500"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                            key={cell.id} 
                            className={`py-2 text-[13px] align-middle whitespace-nowrap ${cell.column.id === "STT" ? "text-center font-bold text-muted-foreground/50" : ""}`}
                        >
                          <div className={`${cell.column.id === "actions" ? "pr-6" : ""}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center text-[13px] font-semibold text-muted-foreground">
                       {globalFilter ? "Không tìm thấy quyền nào phù hợp." : "Chưa có dữ liệu quyền."}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-border/30 bg-card px-5 py-3.5">
        <DataTablePagination table={table} itemName="quyền" />
      </div>
    </div>
  );
}
