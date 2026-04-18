"use client";

import * as React from "react";
import { useRolePermissions } from "@/hooks/use-role-permissions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { 
  Shield, 
  Search, 
  Save, 
  ArrowLeft, 
  Loader2,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { PermissionTable } from "./role-table/permission-table";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";

interface RolePermissionViewProps {
  readonly roleName: string;
}

export function RolePermissionView({ roleName }: RolePermissionViewProps) {
  const router = useRouter();
  const {
    actualRoleName,
    isLoading,
    isSubmitting,
    roots,
    currentL2Options,
    selectedL1,
    setSelectedL1,
    selectedL2,
    setSelectedL2,
    checkedPermissions,
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    handleSave,
  } = useRolePermissions(roleName);

  return (
    <div className="space-y-5 pb-6 w-full overflow-x-hidden">
      <PageHeader
        title={`Thiết lập quyền: ${actualRoleName || "..."}`}
        subtitle={`Chế độ Lazy Loading: Đang quản lý ${checkedPermissions.length} quyền hạn`}
        icon={Shield}

      >
        <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()} 
            className="h-9 rounded-xl gap-1.5 border-border/50 bg-card shadow-sm text-[13px] font-semibold text-muted-foreground hover:bg-muted/50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        <Button
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-9 rounded-xl gap-1.5 shadow-md shadow-primary/20 text-[13px] font-semibold"
        >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Lưu thay đổi
        </Button>
      </PageHeader>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm chức năng..."
              className="h-9 w-full rounded-xl border border-border/40 bg-muted/20 pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
                <div className="h-9 px-3 rounded-l-xl bg-[#eef2ff] border border-r-0 border-primary/20 flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-primary opacity-60" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em] whitespace-nowrap">CẤP 1</span>
                </div>
                <Select value={selectedL1} onValueChange={setSelectedL1}>
                    <SelectTrigger className="h-9 min-w-[180px] rounded-l-none rounded-r-xl bg-white border-primary/20 font-black text-[13px] text-primary focus:ring-0 shadow-sm">
                        <SelectValue placeholder="Chọn module" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60 shadow-xl">
                        {roots.map(n => (
                            <SelectItem key={n.name} value={n.name} className="font-bold">{n.description || n.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center">
                <div className="h-9 px-3 rounded-l-xl bg-[#eef2ff] border border-r-0 border-primary/20 flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-primary opacity-60" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em] whitespace-nowrap">CẤP 2</span>
                </div>
                <Select value={selectedL2} onValueChange={setSelectedL2}>
                    <SelectTrigger className="h-9 min-w-[180px] rounded-l-none rounded-r-xl bg-white border-primary/20 font-black text-[13px] text-primary focus:ring-0 shadow-sm">
                        <SelectValue placeholder="Chọn nhóm" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60 shadow-xl">
                        {currentL2Options.map(n => (
                            <SelectItem key={n.name} value={n.name} className="font-bold">{n.description || n.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="ml-auto hidden lg:block">
              <DataTableViewOptions
                  table={table}
                  columnLabels={{
                      STT: "STT",
                      description: "Chức năng",
                      status: "Trạng thái",
                      view: "Xem",
                      create: "Thêm",
                      update: "Sửa",
                      delete: "Xóa",
                  }}
              />
          </div>
        </div>


      </div>

      <div className="relative">
        <PermissionTable table={table} columns={columns} globalFilter={globalFilter || ""} />
        {isLoading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-border/40 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-[13px] font-bold text-muted-foreground">Đang đồng bộ dữ liệu...</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
