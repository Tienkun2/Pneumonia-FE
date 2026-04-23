"use client";

import { UserSession } from "@/utils/session-schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBadgeClass } from "@/constants/styles";
import { Button } from "@/components/ui/button";
import { Power, ShieldAlert, Clock, Globe, Inbox } from "lucide-react";
import { getDeviceIcon, getBrowserIcon } from "./session-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  useReactTable 
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

interface SessionTableProps {
  sessions: UserSession[];
  onRevoke: (id: string) => void;
  isRevoking: boolean;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function parseUA(ua: string) {
  if (!ua) return { browser: "Hệ thống", device: "UNKNOWN" };
  
  let browser = "Trình duyệt";
  let device = "Máy tính";

  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox/")) browser = "Firefox";

  // Detect OS/Device
  if (ua.includes("Windows")) device = "Windows PC";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS")) device = "MacBook";
  else if (ua.includes("iPhone")) device = "iPhone";
  else if (ua.includes("Android")) device = "Android";
  else if (ua.includes("Linux")) device = "Linux PC";

  return { browser, device };
}

import { SESSION_STATUS, SESSION_STATUS_MAP } from "@/constants/session";

export function SessionTable({ 
  sessions, 
  onRevoke, 
  isRevoking, 
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: SessionTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  
  const columns: ColumnDef<UserSession>[] = [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => (
        <span className="text-[13px] font-medium text-muted-foreground/60 px-2">
          {row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "device",
      header: "Thiết bị / Trình duyệt",
      cell: ({ row }) => {
        const session = row.original;
        const { browser, device } = parseUA(session.userAgent || "");
        const displayBrowser = session.appName || browser;
        const displayDevice = session.deviceType || device;

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 group-hover:scale-110 transition-transform">
              {getDeviceIcon(displayDevice)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-[13px]">
                {getBrowserIcon(displayBrowser)}
                {displayBrowser}
              </div>
              <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-wider">
                {displayDevice}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "ipAddress",
      header: "Địa chỉ IP",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-[13px] font-medium text-foreground/80">
          <Globe className="h-3.5 w-3.5 text-muted-foreground/40" />
          {row.original.ipAddress || "0.0.0.0"}
        </div>
      )
    },
    {
      accessorKey: "loginTime",
      header: "Thời gian đăng nhập",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-[13px] font-bold">
                <Clock className="h-3.5 w-3.5 text-primary/40" />
                {session.loginTime ? format(new Date(session.loginTime), "HH:mm, dd/MM/yyyy", { locale: vi }) : "N/A"}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground/50">
                Hết hạn: {session.expiryTime ? format(new Date(session.expiryTime), "dd/MM/yyyy", { locale: vi }) : "N/A"}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status as keyof typeof SESSION_STATUS_MAP;
        const statusInfo = SESSION_STATUS_MAP[status] || SESSION_STATUS_MAP[SESSION_STATUS.ACTIVE];
        
        return (
          <span className={getBadgeClass(statusInfo.variant as "success" | "destructive" | "secondary" | "info")}>
            {statusInfo.label}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => {
        const session = row.original;
        const isActive = session.status === SESSION_STATUS.ACTIVE;
        return (
          <div className="text-right">
            {isActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmId(session.id)}
                disabled={isRevoking}
                className="h-8 rounded-lg px-3 gap-2 text-[11px] font-black bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all uppercase tracking-widest border border-destructive/10"
              >
                <Power className="h-3.5 w-3.5" />
                Thu hồi
              </Button>
            ) : (
              <div className="flex items-center justify-end text-muted-foreground/30">
                  <ShieldAlert className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleConfirmRevoke = async () => {
    if (confirmId) {
      await onRevoke(confirmId);
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="h-12 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
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
                    <p className="text-sm font-bold text-muted-foreground/40 italic">Không tìm thấy phiên hoạt động nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} itemName="phiên" />

      <div className="flex items-center justify-between gap-4 mt-6">
        <div className="flex-1 text-[12px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            Trang {currentPage} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="h-8 px-4 rounded-lg font-bold text-[11px]"
                onClick={() => onPageChange?.(Math.max(1, (currentPage || 1) - 1))}
                disabled={currentPage === 1 || isLoading}
            >
                TRƯỚC
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="h-8 px-4 rounded-lg font-bold text-[11px]"
                onClick={() => onPageChange?.(Math.min(totalPages || 1, (currentPage || 1) + 1))}
                disabled={currentPage === totalPages || isLoading}
            >
                SAU
            </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden border-border/50 shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/5">
                  <ShieldAlert className="h-5 w-5" />
               </div>
               <DialogTitle className="text-lg font-black tracking-tight">Xác nhận thu hồi?</DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn thu hồi quyền truy cập của phiên hoạt động này?
              Người dùng sẽ bị đăng xuất ngay lập tức khỏi thiết bị đó.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 pt-2 flex gap-3">
            <Button 
              variant="ghost" 
              className="flex-1 rounded-xl font-bold h-11 text-muted-foreground hover:bg-muted" 
              onClick={() => setConfirmId(null)}
            >
              HỦY BỎ
            </Button>
            <Button 
              variant="destructive"
              className="flex-1 rounded-xl font-bold h-11 transition-all active:scale-95 shadow-lg shadow-destructive/20 uppercase tracking-wider text-[11px]" 
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? "Đang xử lý..." : "XÁC NHẬN THU HỒI"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
