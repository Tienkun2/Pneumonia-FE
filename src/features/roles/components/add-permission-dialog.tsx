"use client";

import { PermissionTreeNode } from "@/types/permission";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, X, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionTable } from "../role-table/permission-table";
import { cn } from "@/lib/utils";
import { FORM_STYLES, MODAL_STYLES } from "@/constants/styles";
import { useAddPermissionTable } from "@/hooks/use-add-permission-table";

interface AddPermissionDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly roleName: string;
  readonly roots: PermissionTreeNode[];
  readonly currentL2Options: PermissionTreeNode[];
  readonly selectedL1: string;
  readonly setSelectedL1: (val: string) => void;
  readonly selectedL2: string;
  readonly setSelectedL2: (val: string) => void;
  readonly data: PermissionTreeNode[];
  readonly onToggle: (name: string, checked: boolean) => void;
  readonly onSave: () => void;
  readonly isLoading: boolean;
}

export function AddPermissionDialog({
  open,
  onOpenChange,
  roleName,
  roots,
  currentL2Options,
  selectedL1,
  setSelectedL1,
  selectedL2,
  setSelectedL2,
  data,
  onToggle,
  onSave,
  isLoading,
}: AddPermissionDialogProps) {
  const { table, columns, globalFilter, setGlobalFilter } = useAddPermissionTable({
    data,
    onToggle,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(MODAL_STYLES.contentWide, "max-w-3xl")}>
        <DialogHeader className={MODAL_STYLES.header}>
          <DialogTitle className={MODAL_STYLES.title}>
            Thêm chức năng cho vai trò <span className="text-foreground">{roleName}</span>
          </DialogTitle>
          <DialogDescription className={MODAL_STYLES.description}>
            Chọn và cấu hình quyền cho các chức năng cần gán cho vai trò này
          </DialogDescription>
        </DialogHeader>

        <div className={cn(MODAL_STYLES.body, "pt-2 gap-4")}>
          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <Label className={FORM_STYLES.label}>Nhóm chức năng cấp 1</Label>
              <Select value={selectedL1} onValueChange={setSelectedL1}>
                <SelectTrigger className={FORM_STYLES.input}>
                  <SelectValue placeholder="Chọn module" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {roots.map(n => (
                    <SelectItem key={n.name} value={n.name} className="text-sm">{n.description || n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className={FORM_STYLES.label}>Nhóm chức năng cấp 2</Label>
              <Select value={selectedL2} onValueChange={setSelectedL2}>
                <SelectTrigger className={FORM_STYLES.input}>
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {currentL2Options.map(n => (
                    <SelectItem key={n.name} value={n.name} className="text-sm">{n.description || n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm theo tên chức năng..."
              className={FORM_STYLES.input + " pl-9"}
            />
          </div>

          {/* Table Area */}
          <div className="border border-border/40 rounded-lg overflow-hidden bg-muted/5 min-h-[250px]">
            <PermissionTable 
              table={table} 
              columns={columns} 
              globalFilter={globalFilter} 
              isLoading={isLoading}
              hidePagination
            />
          </div>
        </div>

        <DialogFooter className={MODAL_STYLES.footer}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={FORM_STYLES.buttonSecondary}
          >
            <X className="h-4 w-4 mr-1.5" /> Hủy
          </Button>
          <Button
            onClick={onSave}
            className={FORM_STYLES.buttonPrimary}
          >
            <Save className="h-4 w-4 mr-1.5" /> Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
