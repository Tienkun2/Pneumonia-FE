"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchUsers, deleteUserThunk, updateUserThunk } from "@/store/slices/user-slice";
import { User, UpdateUserPayload } from "@/types/user";
import { toast } from "sonner";
import { USER_STATUS } from "@/constants/user";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useUserTable } from "@/hooks/use-user-table";

export function useUserListing() {
  const dispatch = useDispatch<AppDispatch>();
  const [isMounted, setIsMounted] = useState(false);

  const { users, isLoading, totalElements, totalPages, currentPage, pageSize } = useSelector(
    (state: RootState) => state.user
  );

  const [pagination, setPagination] = useState({
    pageIndex: currentPage - 1,
    pageSize: pageSize,
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Action states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [statusUserToToggle, setStatusUserToToggle] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setShowFormDialog(true);
  }, []);

  const handleDeleteClick = useCallback((id: string, username: string) => {
    setUserToDelete({ id, username });
  }, []);

  const handleRoleClick = useCallback((user: User) => {
    setRoleUser(user);
    setShowRoleDialog(true);
  }, []);

  const handleToggleStatusClick = useCallback((user: User) => {
    setStatusUserToToggle(user);
  }, []);

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

  // Reset pagination on filter change
  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [globalFilter, columnFilters]);

  // Data fetching effect
  useEffect(() => {
    if (!isMounted) return;

    const filters = {
      search: globalFilter,
      status: columnFilters.find((f) => f.id === "status")?.value as string[],
      role: columnFilters.find((f) => f.id === "roles")?.value as string[],
      startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const promise = dispatch(
      fetchUsers({
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
        filters,
      })
    );

    return () => promise.abort();
  }, [dispatch, pagination, globalFilter, columnFilters, dateRange, isMounted]);

  const confirmToggleStatus = async () => {
    if (!statusUserToToggle) return;
    setIsTogglingStatus(true);
    try {
      const newStatus =
        statusUserToToggle.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
      const payload: UpdateUserPayload = {
        username: statusUserToToggle.username,
        status: newStatus,
        roles: statusUserToToggle.roles?.map((r) => r.name) || [],
      };
      await dispatch(updateUserThunk({ id: statusUserToToggle.id, payload })).unwrap();
      toast.success(
        `Đã ${newStatus === USER_STATUS.ACTIVE ? "kích hoạt" : "khóa"} tài khoản ${
          statusUserToToggle.username
        }`
      );
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

  const handleRefresh = useCallback(() => {
     const filters = {
      search: globalFilter,
      status: columnFilters.find((f) => f.id === "status")?.value as string[],
      role: columnFilters.find((f) => f.id === "roles")?.value as string[],
    };
    dispatch(fetchUsers({
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
        filters,
    }));
  }, [dispatch, pagination, globalFilter, columnFilters]);

  return {
    // Data state
    users,
    isLoading,
    totalElements,
    
    // Table state
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    pagination,
    setPagination,
    dateRange,
    setDateRange,

    // Dialog states
    showFormDialog,
    setShowFormDialog,
    editingUser,
    setEditingUser,
    showRoleDialog,
    setShowRoleDialog,
    roleUser,
    setRoleUser,
    statusUserToToggle,
    setStatusUserToToggle,
    isTogglingStatus,
    userToDelete,
    setUserToDelete,

    // Actions
    handleEdit,
    handleDeleteClick,
    handleRoleClick,
    handleToggleStatusClick,
    confirmToggleStatus,
    confirmDelete,
    handleRefresh,
  };
}
