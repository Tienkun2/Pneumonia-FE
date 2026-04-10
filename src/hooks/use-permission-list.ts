"use client";

import { useState, useEffect, useCallback } from "react";
import { PermissionService } from "@/services/permission-service";
import { PermissionTreeNode } from "@/types/user";
import { toast } from "sonner";
import { usePermissionTable } from "@/features/permissions/permission-table/use-permission-table";

export function usePermissionListing() {
  const [roots, setRoots] = useState<PermissionTreeNode[]>([]);
  const [currentPath, setCurrentPath] = useState<PermissionTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPermission, setNewPermission] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);

  const [loadedChildrenMap, setLoadedChildrenMap] = useState<Record<string, PermissionTreeNode[]>>({});

  const fetchRoots = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await PermissionService.getRoots();
      setRoots(data);
    } catch (error: unknown) {
      toast.error("Không thể tải danh mục quyền");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoots();
  }, [fetchRoots]);

  const handleNavigateDown = async (node: PermissionTreeNode) => {
    if (!loadedChildrenMap[node.name]) {
      try {
        setIsLoading(true);
        const children = await PermissionService.getChildren(node.name);
        setLoadedChildrenMap(prev => ({ ...prev, [node.name]: children }));
        setCurrentPath(prev => [...prev, node]);
      } catch (error: unknown) {
        toast.error("Lỗi khi tải quyền con");
      } finally {
        setIsLoading(false);
      }
    } else {
        setCurrentPath(prev => [...prev, node]);
    }
  };

  const handleNavigateUp = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const navigateToSegment = (index: number) => {
    if (index === -1) {
        setCurrentPath([]);
        return;
    }
    setCurrentPath(prev => prev.slice(0, index + 1));
  };

  const getDisplayedPermissions = (): PermissionTreeNode[] => {
    if (currentPath.length === 0) return roots;
    const lastNode = currentPath[currentPath.length - 1];
    return loadedChildrenMap[lastNode.name] || [];
  };

  const {
      table,
      columns,
      globalFilter,
      setGlobalFilter,
      columnFilters,
  } = usePermissionTable({
      data: getDisplayedPermissions(),
      currentLevel: currentPath.length + 1,
      onNavigateDown: handleNavigateDown,
      onDeleteClick: (name) => setPermissionToDelete(name),
  });

  const handleCreate = async () => {
    if (!newPermission.name) {
      toast.warning("Vui lòng nhập tên quyền");
      return;
    }
    try {
      setIsSubmitting(true);
      await PermissionService.createPermission(newPermission);
      toast.success("Đã thêm quyền mới thành công");
      setShowAddDialog(false);
      setNewPermission({ name: "", description: "" });
      fetchRoots(); // Refresh roots
      // If we are in a sub-path, we might need to refresh that too, 
      // but for simplicity, we refresh roots and reset if needed.
    } catch (error: unknown) {
      toast.error("Không thể thêm quyền");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!permissionToDelete) return;
    try {
      setIsSubmitting(true);
      await PermissionService.deletePermission(permissionToDelete);
      toast.success("Đã xóa quyền thành công");
      setPermissionToDelete(null);
      fetchRoots();
    } catch (error: unknown) {
      toast.error("Không thể xóa quyền");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    permissions: getDisplayedPermissions(),
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
    handleNavigateDown,
    handleNavigateUp,
    navigateToSegment,
    handleCreate,
    handleDelete,
  };
}
