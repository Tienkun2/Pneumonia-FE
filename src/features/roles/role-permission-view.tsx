"use client";

import * as React from "react";
import { useRolePermissions } from "@/hooks/use-role-permissions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  Shield,
  Search,
  ArrowLeft,
} from "lucide-react";
import { AddButton } from "@/components/ui/add-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { PermissionTable } from "./role-table/permission-table";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { AddPermissionDialog } from "./components/add-permission-dialog";

interface RolePermissionViewProps {
  readonly roleName: string;
}

export function RolePermissionView({ roleName }: RolePermissionViewProps) {
  const router = useRouter();
  const {
    actualRoleName,
    isLoading,
    roots,
    currentL2Options,
    selectedL1,
    setSelectedL1,
    selectedL2,
    setSelectedL2,
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    showAddDialog,
    setShowAddDialog,
    displayRows,
    handleToggle,
  } = useRolePermissions(roleName);

  return (
    <div className="space-y-5 pb-6 w-full overflow-x-hidden">
      <PageHeader
        title={`Quản lý quyền của vai trò "${actualRoleName || "..."}"`}
        icon={Shield}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="h-9 rounded-xl gap-1.5 border-border/50 bg-card shadow-sm text-[13px] font-semibold text-muted-foreground hover:bg-muted/50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        <AddButton
          label="Chức năng"
          onClick={() => setShowAddDialog(true)}
        />
      </PageHeader>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm nhanh chức năng..."
              className="h-9 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cấp 1</span>
            <Select value={selectedL1} onValueChange={setSelectedL1}>
              <SelectTrigger className="h-9 min-w-[160px] max-w-[220px] rounded-xl border-border/50 bg-card text-xs font-semibold shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <SelectValue placeholder="Chọn nhóm cấp 1" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-lg">
                {roots.map(n => (
                  <SelectItem key={n.name} value={n.name} className="text-xs">{n.description || n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cấp 2</span>
            <Select value={selectedL2} onValueChange={setSelectedL2}>
              <SelectTrigger className="h-9 min-w-[160px] max-w-[220px] rounded-xl border-border/50 bg-card text-xs font-semibold shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <SelectValue placeholder="Chọn nhóm cấp 2" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-lg">
                {currentL2Options.map(n => (
                  <SelectItem key={n.name} value={n.name} className="text-xs">{n.description || n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <DataTableViewOptions
              table={table}
              columnLabels={{
                STT: "STT",
                description: "Chức năng",
                assign: "Chọn",
                view: "Xem",
                create: "Tạo",
                update: "Sửa",
                delete: "Xóa",
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative">
        <PermissionTable
          table={table}
          columns={columns}
          globalFilter={globalFilter || ""}
          isLoading={isLoading}
        />
      </div>

      {/* Add Permission Dialog */}
      <AddPermissionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        roleName={actualRoleName}
        roots={roots}
        currentL2Options={currentL2Options}
        selectedL1={selectedL1}
        setSelectedL1={setSelectedL1}
        selectedL2={selectedL2}
        setSelectedL2={setSelectedL2}
        data={displayRows}
        onToggle={(name, ck) => handleToggle(name, ck, selectedL2)}
        onSave={() => setShowAddDialog(false)}
        isLoading={isLoading}
      />
    </div>
  );
}
