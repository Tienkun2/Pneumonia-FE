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
import { Download, Loader2, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { USER_STATUS, USER_STATUS_OPTIONS } from "@/constants/user";
import { DateRange } from "react-day-picker";

import { PageHeader } from "@/components/layout/page-header";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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

  return (
    <div className="space-y-4 px-2 pb-4 w-full overflow-x-hidden">
      <PageHeader
        title="Danh sách người dùng"
        icon={Users}
      />

      <TableToolbar
        placeholder="Tìm kiếm tên, email, sđt..."
        value={globalFilter}
        onChange={setGlobalFilter}
      >
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Trạng thái"
            options={USER_STATUS_OPTIONS}
          />
        )}

        {table.getColumn("roles") && (
          <DataTableFacetedFilter
            column={table.getColumn("roles")}
            title="Vai trò"
            options={roleOptions}
          />
        )}

        <DataTableDateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          placeholder="Ngày tạo"
        />

        {(table.getState().columnFilters.length > 0 || globalFilter || dateRange) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              setGlobalFilter("");
              setDateRange(undefined);
            }}
            className="h-9 px-2 lg:px-3 text-muted-foreground border-dashed"
          >
            <X className="mr-2 h-4 w-4" />
            Đặt lại
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2">
            <Upload className="h-4 w-4" />
            Xuất
          </Button>
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2">
            <Download className="h-4 w-4" />
            Nhập
          </Button>
          <Button size="sm" className="h-9 shrink-0 rounded-lg" onClick={() => { setEditingUser(null); setShowFormDialog(true); }}>
            Thêm người dùng
          </Button>
          <DataTableViewOptions
            table={table}
            columnLabels={USER_COLUMN_LABELS}
          />
        </div>
      </TableToolbar>

      {isLoading && users.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <UserTable table={table} columns={columns} globalFilter={globalFilter} />
          <DataTablePagination table={table} itemName="tài khoản" />
        </>
      )}

      {/* Forms & Dialogs */}
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

      <Dialog open={!!statusUserToToggle} onOpenChange={(open) => !open && setStatusUserToToggle(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "Khóa" : "Kích hoạt"} tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "khóa" : "kích hoạt"} tài khoản <strong>{statusUserToToggle?.username}</strong> không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setStatusUserToToggle(null)} disabled={isTogglingStatus} className="rounded-xl">
              Hủy
            </Button>
            <Button
              variant={statusUserToToggle?.status === USER_STATUS.ACTIVE ? "destructive" : "default"}
              onClick={confirmToggleStatus}
              disabled={isTogglingStatus}
              className="rounded-xl"
            >
              {isTogglingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "Khóa" : "Kích hoạt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{userToDelete?.username}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUserToDelete(null)} className="rounded-xl">
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="rounded-xl">
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
