"use client";

import { PermissionFormDialog } from "../action-form/permission-form-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface PermissionDialogsProps {
  readonly showAddDialog: boolean;
  readonly setShowAddDialog: (val: boolean) => void;
  readonly parentName?: string;
  readonly onFormSuccess: () => void;
  readonly permissionToDelete: string | null;
  readonly setPermissionToDelete: (val: string | null) => void;
  readonly isSubmitting: boolean;
  readonly onConfirmDelete: () => void;
}

export function PermissionDialogs({
  showAddDialog,
  setShowAddDialog,
  parentName,
  onFormSuccess,
  permissionToDelete,
  setPermissionToDelete,
  isSubmitting,
  onConfirmDelete,
}: PermissionDialogsProps) {
  return (
    <>
      <PermissionFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        parentName={parentName}
        onSuccess={onFormSuccess}
      />

      <Dialog
        open={!!permissionToDelete}
        onOpenChange={(open) => !open && setPermissionToDelete(null)}
      >
        <DialogContent className="max-w-sm rounded-[24px] overflow-hidden border-none shadow-2xl p-0">
          <div className="p-8 text-center bg-background">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 animate-pulse">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <DialogHeader className="p-0 mb-6">
              <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Cảnh báo xóa!</DialogTitle>
              <DialogDescription className="text-center font-medium text-[13px] opacity-70 mt-2">
                Quyền <strong className="text-foreground">{permissionToDelete}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                variant="destructive"
                className="h-12 rounded-xl w-full font-bold text-[13px] shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all"
                onClick={onConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Tôi chắc chắn, hãy xóa ngay
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl w-full font-bold text-[13px] border-border/50 active:scale-[0.98] transition-all"
                onClick={() => setPermissionToDelete(null)}
              >
                Quay lại
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
