"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { RoleService } from "@/services/role-service";
import { PermissionService } from "@/services/permission-service";
import { PermissionTreeNode } from "@/types/permission";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePermissionTable } from "@/hooks/use-role-permission-table";

export function useRolePermissions(roleName: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [roots, setRoots] = useState<PermissionTreeNode[]>([]);
  const [l2Cache, setL2Cache] = useState<Record<string, PermissionTreeNode[]>>({});
  const [rowCache, setRowCache] = useState<Record<string, PermissionTreeNode[]>>({});

  const [selectedL1, setSelectedL1] = useState<string>("");
  const [selectedL2, setSelectedL2] = useState<string>("");
  const [checkedPermissions, setCheckedPermissions] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const actualRoleName = useMemo(() => decodeURIComponent(roleName || ""), [roleName]);

  const init = useCallback(async () => {
    try {
      setIsLoading(true);
      const rootNodes = await PermissionService.getRoots(actualRoleName);
      setRoots(rootNodes);

      const fullTree = await PermissionService.getPermissionTree(actualRoleName);
      const extractCheckedFromTree = (nodes: PermissionTreeNode[]): string[] => {
        let checked: string[] = [];
        nodes.forEach(n => {
          if (n.isChecked) checked.push(n.name);
          if (n.children) checked = [...checked, ...extractCheckedFromTree(n.children)];
        });
        return checked;
      };
      setCheckedPermissions(extractCheckedFromTree(fullTree));

      if (rootNodes.length > 0) {
        setSelectedL1(rootNodes[0].name);
      }
    } catch (error: unknown) {
      toast.error("Không thể khởi tạo dữ liệu phân quyền");
    } finally {
      setIsLoading(false);
    }
  }, [actualRoleName]);

  useEffect(() => {
    if (actualRoleName) init();
  }, [actualRoleName, init]);

  // Step 2: Fetch L2 (Functional Groups) when L1 changes
  useEffect(() => {
    if (!selectedL1) return;
    if (l2Cache[selectedL1]) {
      const cached = l2Cache[selectedL1];
      if (cached.length > 0) setSelectedL2(cached[0].name);
      else setSelectedL2("");
      return;
    }

    const fetchL2 = async () => {
      try {
        const children = await PermissionService.getChildren(selectedL1, actualRoleName);
        setL2Cache(prev => ({ ...prev, [selectedL1]: children }));
        if (children.length > 0) setSelectedL2(children[0].name);
        else setSelectedL2("");
      } catch (error: unknown) {
        toast.error("Lỗi khi tải nhóm chức năng");
      }
    };
    fetchL2();
  }, [selectedL1, actualRoleName, l2Cache]);

  // Step 3: Fetch Detailed Permissions (Table Rows) when L2 changes
  useEffect(() => {
    if (!selectedL2) return;
    if (rowCache[selectedL2]) {
      // We still need to mark it as loading to show progress bar if needed
      return;
    };

    const fetchRows = async () => {
      try {
        setIsLoading(true);
        const children = await PermissionService.getChildren(selectedL2, actualRoleName);
        setRowCache(prev => ({ ...prev, [selectedL2]: children }));
      } catch (error: unknown) {
        toast.error("Lỗi khi tải chi tiết chức năng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRows();
  }, [selectedL2, actualRoleName, rowCache]);

  const handleToggle = useCallback((name: string, checked: boolean, currentL2: string) => {
    const updateRecursive = (nodes: PermissionTreeNode[], target: string, ck: boolean, forceChildren: boolean = false): PermissionTreeNode[] => {
      return nodes.map(n => {
        let isChecked = n.isChecked;
        let children = n.children;

        if (n.name === target || forceChildren) {
          isChecked = ck;
          if (n.children) {
            children = updateRecursive(n.children, target, ck, true);
          }
        } else if (n.children) {
          children = updateRecursive(n.children, target, ck, false);
        }

        return { ...n, isChecked, children };
      });
    };

    if (rowCache[currentL2]) {
      const updatedRows = updateRecursive(rowCache[currentL2], name, checked);
      setRowCache(prev => ({ ...prev, [currentL2]: updatedRows }));

      const getAllCheckedNames = (nodes: PermissionTreeNode[]): string[] => {
        let chk: string[] = [];
        nodes.forEach(n => {
          if (n.isChecked) chk.push(n.name);
          if (n.children) chk = [...chk, ...getAllCheckedNames(n.children)];
        });
        return chk;
      };

      setCheckedPermissions(prev => {
        const namesInCurrentView = new Set<string>();
        const findNames = (nodes: PermissionTreeNode[]) => nodes.forEach(n => {
          namesInCurrentView.add(n.name);
          if (n.children) findNames(n.children);
        });
        findNames(rowCache[currentL2]);

        const filteredPrev = prev.filter(p => !namesInCurrentView.has(p));
        const newlyChecked = getAllCheckedNames(updatedRows);
        return Array.from(new Set([...filteredPrev, ...newlyChecked]));
      });
    }
  }, [rowCache]);

  const displayRows = useMemo(() => {
    const rows = rowCache[selectedL2] || [];
    // Sync isChecked with global state checkedPermissions
    const syncWithChecked = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(n => ({
        ...n,
        isChecked: checkedPermissions.includes(n.name),
        children: n.children ? syncWithChecked(n.children) : undefined
      }));
    };
    return syncWithChecked(rows);
  }, [rowCache, selectedL2, checkedPermissions]);

  const currentL2Options = useMemo(() => l2Cache[selectedL1] || [], [l2Cache, selectedL1]);

  const {
    table,
    columns,
    globalFilter,
    setGlobalFilter,
  } = usePermissionTable({
    data: displayRows,
    onToggle: (name, ck) => handleToggle(name, ck, selectedL2),
  });

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await RoleService.updateRole(actualRoleName, {
        description: "",
        permissions: checkedPermissions
      });
      toast.success("Cập nhật quyền hạn thành công");
      router.back();
    } catch (error: unknown) {
      toast.error("Không thể lưu phân quyền");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    actualRoleName,
    isLoading,
    isSubmitting,
    roots,
    currentL2Options,
    selectedL1,
    setSelectedL1,
    selectedL2,
    setSelectedL2,
    checkedPermissions,
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    showAddDialog,
    setShowAddDialog,
    displayRows,
    handleToggle,
    handleSave,
  };
}
