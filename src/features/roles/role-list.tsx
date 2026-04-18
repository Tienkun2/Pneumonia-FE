"use client";

import * as React from "react";
import { useRoleListing } from "@/hooks/use-role-list";
import { RoleTable } from "./role-table/role-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Search, 
  X
} from "lucide-react";
import { RoleDialogs } from "./components/role-dialogs";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { DateRange } from "react-day-picker";
import { AddButton } from "@/components/ui/add-button";

import { STATUS_OPTIONS } from "@/constants/common";
import { ROLE_COLUMN_LABELS } from "@/constants/role";

export function RoleList() {
  const {
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
        icon={Shield}

      >
        <AddButton
          label="vai trò"
          onClick={handleOpenAdd}
        />
      </PageHeader>

      <div className="rounded-[24px] bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 flex flex-col overflow-hidden border border-border/40 p-4">
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


      </div>

      <RoleTable 
        table={table} 
        columns={columns} 
        globalFilter={globalFilter || ""} 
        isLoading={isLoading} 
      />

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

