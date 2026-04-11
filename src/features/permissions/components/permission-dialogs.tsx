"use client";

import { PermissionFormDialog } from "../action-form/permission-form-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
        <DialogContent className="max-w-sm rounded-2xl text-center p-8 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 animate-pulse">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Cảnh báo xóa!</DialogTitle>
            <DialogDescription className="text-center font-medium opacity-70">
              Quyền <strong className="text-foreground">{permissionToDelete}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isSubmitting}
              className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest shadow-xl shadow-destructive/20 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Tôi chắc chắn, hãy xóa ngay
            </Button>
            <Button
              variant="outline"
              onClick={() => setPermissionToDelete(null)}
              className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest"
            >
              Quay lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
