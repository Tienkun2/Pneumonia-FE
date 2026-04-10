"use client";

import * as React from "react";
import { usePermissionListing } from "@/hooks/use-permission-list";
import { PermissionTable } from "./permission-table/permission-table";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { 
  Plus, 
  Search, 
  Loader2, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle,
  Home,
  ChevronLeft,
  SlidersHorizontal,
  X
} from "lucide-react";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export function PermissionList() {
  const {
    currentPath,
    isLoading,
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    showAddDialog,
    setShowAddDialog,
    newPermission,
    setNewPermission,
    isSubmitting,
    permissionToDelete,
    setPermissionToDelete,
    handleNavigateUp,
    navigateToSegment,
    handleCreate,
    handleDelete,
  } = usePermissionListing();

  const hasActiveFilters = columnFilters.length > 0 || !!globalFilter;

  const PERMISSION_COLUMN_LABELS = {
    name: "Tên chức năng",
    description: "Mô tả nghiệp vụ",
    level: "Cấp độ",
    createdAt: "Ngày tạo",
    status: "Trạng thái",
    STT: "STT",
  };


  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Quản lý chức năng"
        subtitle="Quản lý hệ thống các chức năng và quyền hạn phân cấp"
        icon={CheckCircle}
      >
        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="h-9 rounded-xl gap-1.5 shadow-md shadow-primary/20 text-[13px] font-semibold"
        >
          <Plus className="h-3.5 w-3.5" /> Thêm quyền mới
        </Button>
      </PageHeader>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div 
              className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => navigateToSegment(-1)}
            >
                <Home className="h-4 w-4 text-muted-foreground" />
            </div>
            <span 
              className={cn(
                "text-[13px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors",
                currentPath.length === 0 ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted/50"
              )}
              onClick={() => navigateToSegment(-1)}
            >
              Gốc
            </span>
            {currentPath.map((node, index) => (
              <React.Fragment key={node.name}>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                <span 
                  className={cn(
                    "text-[13px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors",
                    index === currentPath.length - 1 ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted/50"
                  )}
                  onClick={() => navigateToSegment(index)}
                >
                  {node.name}
                </span>
              </React.Fragment>
            ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPath.length === 0}
          onClick={handleNavigateUp}
          className="h-9 rounded-xl gap-1.5 border-border/50 font-bold text-[13px] bg-card hover:bg-muted/50 transition-all"
        >
            <ChevronLeft className="h-3.5 w-3.5" /> Quay lại
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none opacity-50" />
            <input
              placeholder="Tìm kiếm chính xác chức năng..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all shadow-sm"
            />
          </div>

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Trạng thái"
              options={[
                { label: "Đang hoạt động", value: "active" },
                { label: "Ngừng hoạt động", value: "inactive" },
              ]}
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
                columnLabels={PERMISSION_COLUMN_LABELS}
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

      <div className="transition-all duration-300 ease-in-out">
        <PermissionTable 
            table={table} 
            columns={columns} 
            globalFilter={globalFilter || ""} 
            isLoading={isLoading} 
        />
      </div>

      {/* Action Dialogs */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b border-border/40 bg-muted/10 text-left">
            <DialogTitle className="text-lg font-black uppercase tracking-tight">Thêm quyền mới</DialogTitle>
            <DialogDescription className="font-medium text-[13px]">Khởi tạo một mã định danh quyền truy cập mới trong hệ thống.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-8 bg-background">
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Mã quyền <span className="text-destructive">*</span></Label>
              <Input
                placeholder="VD: SYST_ROOT, USER_READ..."
                value={newPermission.name}
                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value.toUpperCase() })}
                className="h-11 rounded-xl border-border/50 font-bold text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Mô tả nghiệp vụ</Label>
              <Input
                placeholder="Mô tả chức năng của quyền này..."
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                className="h-11 rounded-xl border-border/50 font-medium text-[13px]"
              />
            </div>
          </div>
          <DialogFooter className="p-8 border-t border-border/40 bg-muted/5 gap-3">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="h-10 rounded-xl flex-1 font-bold">Hủy</Button>
            <Button onClick={handleCreate} disabled={isSubmitting} className="h-10 rounded-xl flex-1 bg-primary text-white shadow-lg shadow-primary/20 font-bold">
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Plus className="h-3.5 w-3.5 mr-2" />}
              Lưu lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!permissionToDelete} onOpenChange={(open) => !open && setPermissionToDelete(null)}>
        <DialogContent className="max-w-sm rounded-2xl text-center p-8 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 animate-pulse">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Cảnh báo xóa!</DialogTitle>
            <DialogDescription className="text-center font-medium opacity-70">
              Quyền <strong className="text-foreground">{permissionToDelete}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2">
            <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={isSubmitting} 
                className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest shadow-xl shadow-destructive/20 active:scale-[0.98]"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Tôi chắc chắn, hãy xóa ngay
            </Button>
            <Button 
                variant="outline" 
                onClick={() => setPermissionToDelete(null)} 
                className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest"
            >
                Quay lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
