"use client";

import { useState, useEffect, useCallback } from "react";
import { RoleService } from "@/services/role-service";
import { Role } from "@/types/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRoleTable } from "@/features/roles/role-table/use-role-table";

export function useRoleListing() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [rolePayload, setRolePayload] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });

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
    setRolePayload({ name: "", description: "" });
    setShowFormDialog(true);
  }, []);

  const handleEditBasic = useCallback((role: Role) => {
    setEditingRole(role);
    setRolePayload({
      name: role.name,
      description: role.description,
    });
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

  const handleSubmitBasic = async () => {
    if (!rolePayload.name) {
      toast.warning("Vui lòng nhập tên vai trò");
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingRole) {
        await RoleService.updateRole(editingRole.name, {
          description: rolePayload.description,
          permissions: editingRole.permissions?.map(p => p.name) || []
        });
        toast.success("Cập nhật vai trò thành công");
      } else {
        await RoleService.createRole({ ...rolePayload, permissions: [] });
        toast.success("Thêm vai trò mới thành công");
      }
      setShowFormDialog(false);
      fetchData();
    } catch (error: unknown) {
      toast.error("Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    rolePayload,
    setRolePayload,
    roleToDelete,
    setRoleToDelete,
    handleOpenAdd,
    handleSubmitBasic,
    handleDelete,
  };
}
