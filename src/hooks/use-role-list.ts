"use client";

import { useState, useEffect, useCallback } from "react";
import { RoleService } from "@/services/role-service";
import { Role } from "@/types/role";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRoleTable } from "@/hooks/use-role-table";

export function useRoleListing() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const rolesData = await RoleService.getRoles();
      setRoles(rolesData);
    } catch (error: unknown) {
      toast.error("Không thể tải dữ liệu vai trò");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = useCallback(() => {
    setEditingRole(null);
    setShowFormDialog(true);
  }, []);

  const handleEditBasic = useCallback((role: Role) => {
    setEditingRole(role);
    setShowFormDialog(true);
  }, []);

  const navigateToPermissions = useCallback((role: Role) => {
    router.push(`/system/role-management/role-list/${encodeURIComponent(role.name)}/permissions`);
  }, [router]);

  const {
      table,
      columns,
      globalFilter,
      setGlobalFilter,
      columnFilters,
  } = useRoleTable({
      data: roles,
      onEdit: handleEditBasic,
      onPermissionClick: navigateToPermissions,
      onDeleteClick: (name) => setRoleToDelete(name),
  });

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      setIsSubmitting(true);
      await RoleService.deleteRole(roleToDelete);
      toast.success("Đã xóa vai trò thành công");
      setRoleToDelete(null);
      fetchData();
    } catch (error: unknown) {
      toast.error("Không thể xóa vai trò");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
