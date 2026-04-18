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
import { FORM_STYLES } from "@/utils/styles";
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
      <DialogContent className="max-w-3xl rounded-[24px] p-0 overflow-hidden border border-border/40 shadow-2xl bg-background">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-black text-foreground">
            Thêm chức năng cho vai trò <span className="text-foreground">{roleName}</span>
          </DialogTitle>
          <DialogDescription className="text-[12px] font-medium text-muted-foreground/60">
            Chọn và cấu hình quyền cho các chức năng cần gán cho vai trò này
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-2.5">
          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-left">
              <Label className={cn(FORM_STYLES.label, "font-bold text-foreground text-[11px]")}>Nhóm chức năng cấp 1</Label>
              <Select value={selectedL1} onValueChange={setSelectedL1}>
                <SelectTrigger className="h-8 rounded-lg border-border/60 bg-background font-medium text-[12px]">
                  <SelectValue placeholder="Chọn module" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {roots.map(n => (
                    <SelectItem key={n.name} value={n.name} className="font-medium h-8 text-[12px]">{n.description || n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 text-left">
              <Label className={cn(FORM_STYLES.label, "font-bold text-foreground text-[11px]")}>Nhóm chức năng cấp 2</Label>
              <Select value={selectedL2} onValueChange={setSelectedL2}>
                <SelectTrigger className="h-8 rounded-lg border-border/60 bg-background font-medium text-[12px]">
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {currentL2Options.map(n => (
                    <SelectItem key={n.name} value={n.name} className="font-medium h-8 text-[12px]">{n.description || n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
            <Input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm theo tên chức năng..."
              className="h-8 pl-8 rounded-lg border-border/40 bg-muted/5 placeholder:font-medium font-medium text-[12px]"
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

        <DialogFooter className="p-4 pt-0 bg-background">
          <div className="flex w-full items-center justify-end gap-2 px-4 pb-2">
             <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-8 px-4 rounded-lg font-bold gap-1.5 text-foreground border-border/60 hover:bg-muted/50 text-[12px]"
             >
                <X className="h-3.5 w-3.5" /> Hủy
             </Button>
             <Button
                onClick={onSave}
                className="h-8 px-6 rounded-lg font-bold gap-1.5 bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 text-primary-foreground text-[12px]"
             >
                <Save className="h-3.5 w-3.5" /> Lưu
             </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
