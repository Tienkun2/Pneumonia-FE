import { flexRender, Table as ReactTable, ColumnDef } from "@tanstack/react-table";
import { Patient } from "@/types/patient";
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

interface PatientTableProps {
  readonly table: ReactTable<Patient>;
  readonly columns: ColumnDef<Patient>[];
  readonly globalFilter: string;
  readonly isLoading?: boolean;
}

export function PatientTable({ table, columns, globalFilter, isLoading }: PatientTableProps) {
  const hasRows = table.getRowModel().rows?.length > 0;
  return (
    <div className="rounded-[24px] bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 flex flex-col overflow-hidden border border-border/40 relative">
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <Progress value={undefined} className="h-0.5 rounded-none bg-transparent [&>div]:bg-primary" />
        </div>
      )}

      {/* Scrollable table body */}
      <div className={cn("overflow-x-auto overflow-y-auto transition-all duration-300", isLoading && hasRows ? "opacity-50 pointer-events-none blur-[0.5px]" : "opacity-100")} style={{ maxHeight: "calc(100vh - 340px)", minHeight: 400 }}>
        <Table className="min-w-[1200px] border-separate border-spacing-0">
          <TableHeader className="bg-card border-b border-border/40 sticky top-0 z-10 shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[12px] font-extrabold text-muted-foreground uppercase tracking-wider py-3.5 whitespace-nowrap align-middle bg-card"
                  >
                    {header.isPlaceholder ? null : (
                      <div className={`flex items-center ${header.id === "actions" ? "justify-end" : "justify-start"}`}>
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
                        <TableCell key={cell.id} className="py-3.5 text-[13px] text-foreground/90 font-semibold align-middle whitespace-nowrap first:pl-8">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center text-[13px] font-semibold text-muted-foreground">
                      {globalFilter ? "Không tìm thấy bệnh nhân nào phù hợp." : "Chưa có dữ liệu bệnh nhân."}
                    </TableCell>
                  </TableRow>
                )}
                </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination luôn nằm cuối card, không cần scroll trang */}
      <div className="border-t border-border/30 bg-card px-5 py-3.5">
        <DataTablePagination table={table} itemName="bệnh nhân" />
      </div>
    </div>
  );
}
