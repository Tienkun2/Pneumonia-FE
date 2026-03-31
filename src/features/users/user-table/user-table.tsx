import { flexRender, Table as ReactTable, ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserTableProps {
  table: ReactTable<User>;
  columns: ColumnDef<User>[];
  globalFilter: string;
}

export function UserTable({ table, columns, globalFilter }: UserTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/80 border-b border-slate-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-slate-700 py-3 whitespace-nowrap align-middle">
                    {header.isPlaceholder ? null : (
                      <div className={`flex items-center ${header.id === "actions" ? "justify-end" : "justify-start"}`}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-slate-50/60 transition-colors border-b-slate-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 text-slate-600 font-medium text-sm align-middle">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {globalFilter ? "Không tìm thấy tài khoản nào phù hợp." : "Chưa có dữ liệu."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
