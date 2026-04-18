"use client";

import * as React from "react";
import { useRolePermissions } from "@/hooks/use-role-permissions";
import { cn } from "@/lib/utils";
import { FORM_STYLES } from "@/utils/styles";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  Shield,
  Search,
  ArrowLeft,
} from "lucide-react";
import { AddButton } from "@/components/ui/add-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
          className="bg-[#2563eb] hover:bg-[#1d4ed8] rounded-full h-9 px-5 shadow-md shadow-blue-500/10 text-white transition-all active:scale-95 text-[13px]"
        />
      </PageHeader>

      <div className="bg-card/60 backdrop-blur-xl rounded-2xl shadow-xl shadow-primary/5 border border-border/40 p-6 space-y-6">
        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <Label className={FORM_STYLES.label}>Nhóm chức năng cấp 1</Label>
            <Select value={selectedL1} onValueChange={setSelectedL1}>
              <SelectTrigger className={cn(FORM_STYLES.input, "rounded-xl bg-background border-border/60 font-bold text-foreground transition-all hover:bg-muted/30 h-11")}>
                <SelectValue placeholder="Chọn nhóm chức năng cấp 1" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/60 shadow-2xl">
                {roots.map(n => (
                  <SelectItem key={n.name} value={n.name} className="font-semibold">{n.description || n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label className={FORM_STYLES.label}>Nhóm chức năng cấp 2</Label>
            <Select value={selectedL2} onValueChange={setSelectedL2}>
              <SelectTrigger className={cn(FORM_STYLES.input, "rounded-xl bg-background border-border/60 font-bold text-foreground transition-all hover:bg-muted/30 h-11")}>
                <SelectValue placeholder="Chọn nhóm chức năng cấp 2" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/60 shadow-2xl">
                {currentL2Options.map(n => (
                  <SelectItem key={n.name} value={n.name} className="font-semibold">{n.description || n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Options Row */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/20">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none z-10" />
            <Input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm nhanh chức năng..."
              className={cn(FORM_STYLES.input, "rounded-xl border-border/40 bg-muted/10 pl-9 pr-4 font-medium transition-all focus:ring-primary/10")}
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
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
