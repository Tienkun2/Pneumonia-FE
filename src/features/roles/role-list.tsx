"use client";

import * as React from "react";
import { useRoleListing } from "@/hooks/use-role-list";
import { RoleTable } from "./role-table/role-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Plus, 
  Search, 
  Loader2,
  SlidersHorizontal,
  X
} from "lucide-react";
import { RoleDialogs } from "./components/role-dialogs";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { DateRange } from "react-day-picker";

import { STATUS_OPTIONS } from "@/constants/common";
import { ROLE_COLUMN_LABELS } from "@/constants/role";

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
    roleToDelete,
    setRoleToDelete,
    handleOpenAdd,
    handleDelete,
    fetchData,
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

      <RoleDialogs
        showFormDialog={showFormDialog}
        setShowFormDialog={setShowFormDialog}
        editingRole={editingRole}
        onFormSuccess={fetchData}
        roleToDelete={roleToDelete}
        setRoleToDelete={setRoleToDelete}
        isSubmitting={isSubmitting}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
}

