"use client";

import * as React from "react";
import { useRoleListing } from "@/hooks/use-role-list";
import { RoleTable } from "./role-table/role-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Plus, 
  Search, 
  Loader2, 
  AlertCircle, 
  SlidersHorizontal,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { DateRange } from "react-day-picker";

const STATUS_OPTIONS = [
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Chờ kích hoạt", value: "PENDING" },
  { label: "Ngừng hoạt động", value: "INACTIVE" },
];

const ROLE_COLUMN_LABELS = {
  name: "Tên vai trò",
  description: "Mô tả",
  status: "Trạng thái",
  userCount: "Số người dùng",
  createdAt: "Ngày tạo",
  STT: "STT",
};

export function RoleList() {
  const {
    roles,
    isLoading,
    isSubmitting,
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    showFormDialog,
    setShowFormDialog,
    editingRole,
    rolePayload,
    setRolePayload,
    roleToDelete,
    setRoleToDelete,
    handleOpenAdd,
    handleSubmitBasic,
    handleDelete,
  } = useRoleListing();

  const hasActiveFilters = columnFilters.length > 0 || !!globalFilter;

  return (
    <div className="space-y-5 pb-6 w-full overflow-x-hidden">
      <PageHeader
        title="Quản lý vai trò"
        subtitle={`Tổng cộng ${roles.length} vai trò trong hệ thống`}
        icon={Shield}
        stats={[
          { label: "Tổng vai trò", value: roles.length, color: "text-primary" },
          { label: "Đang hoạt động", value: roles.length, color: "text-emerald-600" },
          { label: "Số người dùng", value: roles.length * 5, color: "text-amber-600" },
        ]}
      >
        <Button
            onClick={handleOpenAdd}
            size="sm"
            className="h-9 rounded-xl gap-1.5 shadow-md shadow-primary/20 text-[13px] font-semibold"
        >
            <Plus className="h-3.5 w-3.5" /> Thêm vai trò
        </Button>
      </PageHeader>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none opacity-50" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm tên, mô tả..."
              className="h-9 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all shadow-sm"
            />
          </div>

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Trạng thái"
              options={STATUS_OPTIONS}
            />
          )}

          <DataTableDateRangePicker
            date={table.getColumn("createdAt")?.getFilterValue() as DateRange | undefined}
            onDateChange={(date) => table.getColumn("createdAt")?.setFilterValue(date)}
            placeholder="Ngày tạo"
          />

          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setGlobalFilter("");
                        table.resetColumnFilters();
                    }}
                    className="h-9 px-3 text-[13px] font-semibold text-muted-foreground rounded-xl hover:bg-muted/50"
                >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Đặt lại
                </Button>
            )}
            <DataTableViewOptions
                table={table}
                columnLabels={ROLE_COLUMN_LABELS}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-primary">Đang lọc dữ liệu</span>
            {globalFilter && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Tìm kiếm: &ldquo;{globalFilter}&rdquo;
                </span>
            )}
          </div>
        )}
      </div>

      {isLoading && roles.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-[13px] font-bold text-muted-foreground opacity-40">Đang tải danh sách vai trò...</p>
        </div>
      ) : (
        <RoleTable table={table} columns={columns} globalFilter={globalFilter || ""} />
      )}

      {/* Role Action Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b border-border/40 bg-muted/10 text-left">
            <DialogTitle className="text-lg font-black uppercase tracking-tight">{editingRole ? "Cập nhật thông tin" : "Thêm vai trò mới"}</DialogTitle>
            <DialogDescription className="font-medium text-[13px]">Chỉnh sửa các thông tin cơ bản của vai trò và mô tả nghiệp vụ.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 p-8 bg-background">
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Tên vai trò <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Ví dụ: ADMIN, DOCTOR..."
                value={rolePayload.name}
                onChange={(e) => setRolePayload({ ...rolePayload, name: e.target.value.toUpperCase() })}
                disabled={!!editingRole}
                className="h-11 rounded-xl border-border/50 font-bold focus:ring-primary/20 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Mô tả nghiệp vụ</Label>
              <Input
                placeholder="Nhập mô tả cho vai trò này..."
                value={rolePayload.description}
                onChange={(e) => setRolePayload({ ...rolePayload, description: e.target.value })}
                className="h-11 rounded-xl border-border/50 font-medium focus:ring-primary/20 text-[13px]"
              />
            </div>
          </div>
          <DialogFooter className="p-8 border-t border-border/40 bg-muted/5 gap-3">
            <Button variant="outline" onClick={() => setShowFormDialog(false)} className="h-10 rounded-xl font-bold flex-1 border-border/50 text-[13px]">Hủy</Button>
            <Button onClick={handleSubmitBasic} disabled={isSubmitting} className="h-10 rounded-xl font-bold flex-1 bg-primary text-white shadow-lg shadow-primary/20 text-[13px]">
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : editingRole ? (
                "Cập nhật"
              ) : (
                "Tạo mới"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center font-black text-[17px]">Xác nhận xóa vai trò</DialogTitle>
            <DialogDescription className="text-center font-medium text-[13px]">
              Vai trò <strong className="text-foreground">{roleToDelete}</strong> sẽ bị gỡ bỏ khỏi hệ thống. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 flex flex-col">
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="rounded-xl w-full h-11 font-bold text-[13px]">Xác nhận xóa</Button>
            <Button variant="outline" onClick={() => setRoleToDelete(null)} className="rounded-xl w-full h-11 font-bold text-[13px]">Hủy bỏ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
