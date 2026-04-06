"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchUsers, deleteUserThunk, updateUserThunk } from "@/store/slices/userSlice";
import { useUserTable } from "./user-table/use-user-table";
import { UserTable } from "./user-table/user-table";

import { UserFormDialog } from "./action-form/user-form-dialog";
import { UserRoleDialog } from "./action-form/user-role-dialog";
import { User, UpdateUserPayload } from "@/types/user";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Download,
  Loader2,
  Upload,
  Users,
  X,
  UserPlus,
  Search,
  SlidersHorizontal,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { USER_STATUS, USER_STATUS_OPTIONS } from "@/constants/user";
import { DateRange } from "react-day-picker";

import { PageHeader } from "@/components/layout/page-header";

import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { format } from "date-fns";

const USER_COLUMN_LABELS = {
  username: "Tên đăng nhập",
  displayName: "Tên hiển thị",
  email: "Email",
  phoneNumber: "Số điện thoại",
  status: "Trạng thái",
  roles: "Vai trò",
  createdAt: "Ngày tạo",
  STT: "STT",
};

export function UserListingContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { users, isLoading, totalElements, totalPages, currentPage, pageSize } = useSelector((state: RootState) => state.user);

  const [pagination, setPagination] = useState({
    pageIndex: currentPage - 1,
    pageSize: pageSize,
  });

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [statusUserToToggle, setStatusUserToToggle] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, username: string } | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowFormDialog(true);
  };

  const handleDeleteClick = (id: string, username: string) => {
    setUserToDelete({ id, username });
  };

  const handleRoleClick = (user: User) => {
    setRoleUser(user);
    setShowRoleDialog(true);
  };

  const handleToggleStatusClick = (user: User) => {
    setStatusUserToToggle(user);
  };

  const { table, columns, globalFilter, setGlobalFilter, columnFilters } = useUserTable({
    data: users,
    rowCount: totalElements,
    pageCount: totalPages,
    pagination,
    onPaginationChange: setPagination,
    onEdit: handleEdit,
    onRoleClick: handleRoleClick,
    onToggleStatusClick: handleToggleStatusClick,
    onDeleteClick: handleDeleteClick,
  });

  useEffect(() => {
    setPagination(prev => prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 });
  }, [globalFilter, columnFilters]);

  useEffect(() => {
    if (!isMounted) return;

    const filters = {
      search: globalFilter,
      status: columnFilters.find(f => f.id === 'status')?.value as string[],
      role: columnFilters.find(f => f.id === 'roles')?.value as string[],
      startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const promise = dispatch(fetchUsers({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      filters
    }));

    return () => promise.abort();
  }, [dispatch, pagination, globalFilter, columnFilters, dateRange, isMounted]);

  const confirmToggleStatus = async () => {
    if (!statusUserToToggle) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = statusUserToToggle.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
      const payload: UpdateUserPayload = {
        username: statusUserToToggle.username,
        status: newStatus,
        roles: statusUserToToggle.roles?.map((r) => r.name) || [],
      };
      await dispatch(updateUserThunk({ id: statusUserToToggle.id, payload })).unwrap();
      toast.success(`Đã ${newStatus === USER_STATUS.ACTIVE ? "kích hoạt" : "khóa"} tài khoản ${statusUserToToggle.username}`);
      setStatusUserToToggle(null);
    } catch (error: unknown) {
      toast.error((error as string) || "Không thể cập nhật trạng thái");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUserThunk(userToDelete.id)).unwrap();
      toast.success(`Đã xóa tài khoản ${userToDelete.username} thành công`);
      setUserToDelete(null);
    } catch (error: unknown) {
      toast.error((error as string) || "Không thể xóa tài khoản");
    }
  };

  const roleOptions = Array.from(new Set((users || []).flatMap(u => (u.roles || []).map(r => r.name))))
    .map(role => ({ label: role, value: role }));

  const activeCount = users.filter(u => u.status === USER_STATUS.ACTIVE).length;
  const inactiveCount = users.filter(u => u.status !== USER_STATUS.ACTIVE).length;
  const hasActiveFilters = table.getState().columnFilters.length > 0 || !!globalFilter || !!dateRange;

  return (
    <div className="space-y-5 pb-6 w-full overflow-x-hidden">
      {/* ── Page Header ─────────────────────────── */}
      <PageHeader
        title="Quản lý tài khoản"
        subtitle={`Tổng cộng ${totalElements ?? "..."} tài khoản trong hệ thống`}
        icon={Users}
        stats={[
          { label: "Tổng tài khoản", value: totalElements ?? 0, color: "text-primary" },
          { label: "Đang hoạt động", value: activeCount, color: "text-emerald-600" },
          { label: "Chờ kích hoạt", value: inactiveCount, color: "text-amber-600" },
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
          onClick={() => { setEditingUser(null); setShowFormDialog(true); }}
        >
          <UserPlus className="h-3.5 w-3.5" /> Thêm tài khoản
        </Button>
      </PageHeader>

      {/* ── Toolbar (Search + Filters) ──────────── */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm tên, email, SĐT..."
              className="h-9 w-full rounded-xl border border-border/50 bg-muted/30 pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Status filter */}
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Trạng thái"
              options={USER_STATUS_OPTIONS}
            />
          )}

          {/* Role filter */}
          {table.getColumn("roles") && (
            <DataTableFacetedFilter
              column={table.getColumn("roles")}
              title="Vai trò"
              options={roleOptions}
            />
          )}

          {/* Date Range */}
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
            <div className="border-l border-border/40 pl-3">
              <DataTableViewOptions
                table={table}
                columnLabels={USER_COLUMN_LABELS}
              />
            </div>
          </div>
        </div>

        {/* Active filter pills */}
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

      {/* ── Table ──────────────────────────────── */}
      {isLoading && users.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[13px] font-semibold text-muted-foreground">Đang tải danh sách tài khoản...</p>
        </div>
      ) : (
        <UserTable table={table} columns={columns} globalFilter={globalFilter} />
      )}

      {/* ── Dialogs ───────────────────────────── */}
      <UserFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        user={editingUser}
        onSuccess={() => {
          dispatch(fetchUsers({
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
            filters: { search: globalFilter }
          }));
        }}
      />

      <UserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={roleUser}
        onSuccess={() => {
          dispatch(fetchUsers({
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
            filters: { search: globalFilter }
          }));
        }}
      />

      {/* Toggle status dialog */}
      <Dialog open={!!statusUserToToggle} onOpenChange={(open) => !open && setStatusUserToToggle(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${statusUserToToggle?.status === USER_STATUS.ACTIVE ? "bg-destructive/10" : "bg-emerald-50"}`}>
              {statusUserToToggle?.status === USER_STATUS.ACTIVE
                ? <UserX className="h-6 w-6 text-destructive" />
                : <UserCheck className="h-6 w-6 text-emerald-600" />
              }
            </div>
            <DialogTitle className="text-[17px]">
              {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Bạn có chắc chắn muốn {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "khóa" : "kích hoạt"} tài khoản{" "}
              <strong className="text-foreground">{statusUserToToggle?.username}</strong> không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setStatusUserToToggle(null)} disabled={isTogglingStatus} className="flex-1 rounded-xl">
              Hủy bỏ
            </Button>
            <Button
              variant={statusUserToToggle?.status === USER_STATUS.ACTIVE ? "destructive" : "default"}
              onClick={confirmToggleStatus}
              disabled={isTogglingStatus}
              className="flex-1 rounded-xl"
            >
              {isTogglingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "Khóa" : "Kích hoạt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-[17px]">Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription className="text-[13px]">
              Bạn có chắc chắn muốn xóa tài khoản <strong className="text-foreground">{userToDelete?.username}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setUserToDelete(null)} className="flex-1 rounded-xl">
              Hủy bỏ
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1 rounded-xl">
              Xóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
