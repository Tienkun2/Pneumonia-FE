"use client";

import { useUserListing } from "@/hooks/use-user-listing";
import { UserDialogs } from "./components/user-dialogs";
import { UserTable } from "./user-table/user-table";
import { Loader2, Search, UserPlus, Upload, Download, X, Users, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";

import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const USER_COLUMN_LABELS = {
  username: "Tên đăng nhập",
  displayName: "Họ và tên",
  email: "Email",
  phoneNumber: "Số điện thoại",
  status: "Trạng thái",
  roles: "Vai trò",
  createdAt: "Ngày tạo",
  STT: "STT",
};

export function UserListingContentInner() {
  const {
    users,
    isLoading,
    totalElements,
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    dateRange,
    setDateRange,
    showFormDialog,
    setShowFormDialog,
    editingUser,
    setEditingUser,
    showRoleDialog,
    setShowRoleDialog,
    roleUser,
    statusUserToToggle,
    setStatusUserToToggle,
    isTogglingStatus,
    userToDelete,
    setUserToDelete,
    confirmToggleStatus,
    confirmDelete,
    handleRefresh,
  } = useUserListing();

  const activeCount = users.filter(u => u.status === "ACTIVE").length;
  const pendingCount = users.filter(u => u.status === "PENDING").length;

  const roleOptions = Array.from(
    new Set((users || []).flatMap((u) => (u.roles || []).map((r) => r.name)))
  ).map((role) => ({ label: role, value: role }));

  const hasActiveFilters = table.getState().columnFilters.length > 0 || !!globalFilter || !!dateRange;

  return (
    <div className="space-y-5 pb-6 w-full overflow-x-hidden">
      <PageHeader
        title="Quản lý tài khoản"
        subtitle={`Tổng cộng ${totalElements ?? "..."} tài khoản trong hệ thống`}
        icon={Users}
        stats={[
          { label: "Tổng tài khoản", value: totalElements ?? 0, color: "text-primary" },
          { label: "Đang hoạt động", value: activeCount, color: "text-emerald-500" },
          { label: "Chờ kích hoạt", value: pendingCount, color: "text-amber-500" },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl gap-1.5 border-border/50 bg-card shadow-sm text-[13px] font-semibold"
        >
          <Upload className="h-3.5 w-3.5" /> Xuất
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl gap-1.5 border-border/50 bg-card shadow-sm text-[13px] font-semibold"
        >
          <Download className="h-3.5 w-3.5" /> Nhập
        </Button>
        <Button
          size="sm"
          className="h-9 rounded-xl gap-1.5 shadow-md shadow-primary/20 text-[13px] font-semibold"
          onClick={() => {
            setEditingUser(null);
            setShowFormDialog(true);
          }}
        >
          <UserPlus className="h-3.5 w-3.5" /> Thêm tài khoản
        </Button>
      </PageHeader>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm tên, email, SĐT..."
              className="h-9 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Trạng thái"
            options={[
              { label: "Đang hoạt động", value: "ACTIVE" },
              { label: "Chờ kích hoạt", value: "PENDING" },
              { label: "Bị tạm khóa", value: "INACTIVE" },
            ]}
          />

          <DataTableFacetedFilter
            column={table.getColumn("roles")}
            title="Vai trò"
            options={roleOptions}
          />

          <DataTableDateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Ngày tạo"
          />

          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  table.resetColumnFilters();
                  setGlobalFilter("");
                  setDateRange(undefined);
                }}
                className="h-9 px-3 text-[13px] font-semibold text-muted-foreground rounded-xl hover:bg-muted/50"
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Đặt lại
              </Button>
            )}
            <DataTableViewOptions
              table={table}
              columnLabels={USER_COLUMN_LABELS}
            />
          </div>
        </div>

      </div>

      {isLoading && users.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[13px] font-semibold text-muted-foreground">
            Đang tải danh sách tài khoản...
          </p>
        </div>
      ) : users.length === 0 && !isLoading ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-[13px] font-semibold text-destructive">Không tìm thấy dữ liệu tài khoản.</p>
        </div>
      ) : (
        <UserTable table={table} columns={columns} globalFilter={globalFilter} />
      )}

      <UserDialogs
        showFormDialog={showFormDialog}
        setShowFormDialog={setShowFormDialog}
        editingUser={editingUser}
        onFormSuccess={handleRefresh}
        showRoleDialog={showRoleDialog}
        setShowRoleDialog={setShowRoleDialog}
        roleUser={roleUser}
        onRoleSuccess={handleRefresh}
        statusUserToToggle={statusUserToToggle}
        setStatusUserToToggle={setStatusUserToToggle}
        isTogglingStatus={isTogglingStatus}
        onConfirmToggleStatus={confirmToggleStatus}
        userToDelete={userToDelete}
        setUserToDelete={setUserToDelete}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
}
