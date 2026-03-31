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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Search, Loader2, Upload, Download, Settings2, PlusCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, CalendarIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { USER_STATUS, USER_STATUS_OPTIONS } from "@/constants/user";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function UserListingContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading, totalElements, totalPages, currentPage, pageSize } = useSelector((state: RootState) => state.user);

  const [pagination, setPagination] = useState({
    pageIndex: currentPage - 1, // table uses 0-based
    pageSize: pageSize,
  });

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleUser, setRoleUser] = useState<User | null>(null);

  const [statusUserToToggle, setStatusUserToToggle] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const [userToDelete, setUserToDelete] = useState<{id: string, username: string} | null>(null);
  
  const [statusSearch, setStatusSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleCreateNew = () => {
    setEditingUser(null);
    setShowFormDialog(true);
  };

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

  // Refetch when pagination or filters change
  useEffect(() => {
    const filters = {
      search: globalFilter,
      status: columnFilters.find(f => f.id === 'status')?.value as string[],
      role: columnFilters.find(f => f.id === 'roles')?.value as string[],
    };

    dispatch(fetchUsers({ 
      page: pagination.pageIndex + 1, 
      size: pagination.pageSize,
      filters
    }));
  }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => {
      if (prev.pageIndex === 0) return prev;
      return { ...prev, pageIndex: 0 };
    });
  }, [globalFilter, columnFilters]);

  return (
    <div className="space-y-4 px-2 pb-4">
      {/* Page Header is theoretically outside, but if we have local header we can put it here */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách người dùng</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search & Filters (Left) */}
        <div className="flex items-center gap-2 flex-1 w-full flex-wrap">
          <div className="relative w-full max-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tên, email, sđt..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          
          {/* Lọc Trạng Thái */}
          {table.getColumn("status") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-dashed hidden lg:flex">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Trạng thái
                  {(table.getColumn("status")?.getFilterValue() as string[])?.length > 0 && (
                    <span className="ml-1 rounded-sm bg-secondary px-1 py-0.5 text-xs">
                      {(table.getColumn("status")?.getFilterValue() as string[]).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px]">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Tìm trạng thái..." 
                      className="pl-7 h-8 text-sm"
                      value={statusSearch}
                      onChange={(e) => setStatusSearch(e.target.value)}
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                {USER_STATUS_OPTIONS.filter(s => s.label.toLowerCase().includes(statusSearch.toLowerCase())).map((status) => {
                  const filterValue = (table.getColumn("status")?.getFilterValue() as string[]) || [];
                  const isChecked = filterValue.includes(status.value);
                  return (
                    <DropdownMenuItem
                      key={status.value}
                      onSelect={(e) => {
                        e.preventDefault();
                        const newFilter = !isChecked
                          ? [...filterValue, status.value]
                          : filterValue.filter((v) => v !== status.value);
                        table.getColumn("status")?.setFilterValue(newFilter.length ? newFilter : undefined);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox checked={isChecked} className="pointer-events-none" />
                      <span>{status.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Lọc Vai Trò */}
          {table.getColumn("roles") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-dashed hidden lg:flex">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Vai trò
                  {(table.getColumn("roles")?.getFilterValue() as string[])?.length > 0 && (
                    <span className="ml-1 rounded-sm bg-secondary px-1 py-0.5 text-xs">
                      {(table.getColumn("roles")?.getFilterValue() as string[]).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px]">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Tìm vai trò..." 
                      className="pl-7 h-8 text-sm"
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                {/* Lấy danh sách Roles duy nhất từ dữ liệu bảng hiện tại */}
                {Array.from(new Set((users || []).flatMap(u => (u.roles || []).map(r => r.name))))
                 .filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()))
                 .map((roleName) => {
                  const filterValue = (table.getColumn("roles")?.getFilterValue() as string[]) || [];
                  const isChecked = filterValue.includes(roleName);
                  return (
                    <DropdownMenuItem
                      key={roleName}
                      onSelect={(e) => {
                        e.preventDefault();
                        const newFilter = !isChecked
                          ? [...filterValue, roleName]
                          : filterValue.filter((v) => v !== roleName);
                        table.getColumn("roles")?.setFilterValue(newFilter.length ? newFilter : undefined);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox checked={isChecked} className="pointer-events-none" />
                      <span>{roleName}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* Lọc Ngày Tạo */}
          {table.getColumn("createdAt") && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 justify-start text-left border-dashed hidden lg:flex"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                      )
                    ) : (
                      <span>Ngày tạo</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      if (range?.from && range?.to) {
                        table.getColumn("createdAt")?.setFilterValue([range.from, range.to]);
                      } else if (!range?.from && !range?.to) {
                        table.getColumn("createdAt")?.setFilterValue(undefined);
                      }
                    }}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>

              {(table.getState().columnFilters.length > 0 || globalFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    table.resetColumnFilters();
                    setGlobalFilter("");
                    setDateRange(undefined);
                  }}
                  className="h-9 px-2 lg:px-3 text-gray-600 border-dashed"
                >
                  <X className="mr-2 h-4 w-4" />
                  Đặt lại
                </Button>
              )}
            </div>
          )}

          {/* Redundant global reset button removed */}
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2">
            <Upload className="h-4 w-4" />
            Xuất
          </Button>
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2">
            <Download className="h-4 w-4" />
            Nhập
          </Button>
          <Button size="sm" className="h-9 shrink-0" onClick={handleCreateNew}>
            Thêm người dùng
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2 font-normal ml-auto">
                <Settings2 className="h-4 w-4" />
                Hiển thị cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Chọn cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    column.accessorFn !== undefined && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {/* Temporary mapping of column IDs to Vietnamese */}
                      {column.id === "username" && "Tên đăng nhập"}
                      {column.id === "displayName" && "Tên hiển thị"}
                      {column.id === "email" && "Email"}
                      {column.id === "phoneNumber" && "Số điện thoại"}
                      {column.id === "status" && "Trạng thái"}
                      {column.id === "roles" && "Vai trò"}
                      {column.id === "createdAt" && "Ngày tạo"}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table Area */}
      {isLoading && users.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <UserTable table={table} columns={columns} globalFilter={globalFilter} />
      )}

      {/* Footer / Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-sm text-gray-500">
        <div>
          Tổng cộng: <span className="font-medium text-gray-900">{totalElements}</span> dòng
        </div>
        
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">Số hàng trên mỗi trang</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center font-medium text-gray-900">
            Trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount() || 1}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang đầu</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang cuối</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Forms & Dialogs */}
      <UserFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        user={editingUser}
        onSuccess={() => {
          const filters = {
            search: globalFilter,
            status: columnFilters.find(f => f.id === 'status')?.value as string[],
            role: columnFilters.find(f => f.id === 'roles')?.value as string[],
          };
          dispatch(fetchUsers({ 
            page: pagination.pageIndex + 1, 
            size: pagination.pageSize,
            filters
          }));
        }}
      />

      <UserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={roleUser}
        onSuccess={() => {
          const filters = {
            search: globalFilter,
            status: columnFilters.find(f => f.id === 'status')?.value as string[],
            role: columnFilters.find(f => f.id === 'roles')?.value as string[],
          };
          dispatch(fetchUsers({ 
            page: pagination.pageIndex + 1, 
            size: pagination.pageSize,
            filters
          }));
        }}
      />

      <Dialog open={!!statusUserToToggle} onOpenChange={(open) => !open && setStatusUserToToggle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "Khóa" : "Kích hoạt"} tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "khóa" : "kích hoạt"} tài khoản <strong>{statusUserToToggle?.username}</strong> không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setStatusUserToToggle(null)} disabled={isTogglingStatus}>
              Hủy
            </Button>
            <Button 
              variant={statusUserToToggle?.status === USER_STATUS.ACTIVE ? "destructive" : "default"} 
              onClick={confirmToggleStatus} 
              disabled={isTogglingStatus}
            >
              {isTogglingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận {statusUserToToggle?.status === USER_STATUS.ACTIVE ? "Khóa" : "Kích hoạt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{userToDelete?.username}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
