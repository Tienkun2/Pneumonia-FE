"use client";

import { RoleFormDialog } from "../action-form/role-form-dialog";
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
import { Role } from "@/types/role";

interface RoleDialogsProps {
  readonly showFormDialog: boolean;
  readonly setShowFormDialog: (val: boolean) => void;
  readonly editingRole: Role | null;
  readonly onFormSuccess: () => void;
  readonly roleToDelete: string | null;
  readonly setRoleToDelete: (val: string | null) => void;
  readonly isSubmitting: boolean;
  readonly onConfirmDelete: () => void;
}

export function RoleDialogs({
  showFormDialog,
  setShowFormDialog,
  editingRole,
  onFormSuccess,
  roleToDelete,
  setRoleToDelete,
  isSubmitting,
  onConfirmDelete,
}: RoleDialogsProps) {
  return (
    <>
      <RoleFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        role={editingRole}
        onSuccess={onFormSuccess}
      />

      <Dialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl text-center p-8">
            <DialogHeader className="mb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 animate-pulse">
                <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Xác nhận xóa!</DialogTitle>
            <DialogDescription className="text-center font-medium opacity-70">
                Vai trò <strong className="text-foreground">{roleToDelete}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
            </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2">
            <Button
                variant="destructive"
                className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest shadow-xl shadow-destructive/20 active:scale-[0.98]"
                onClick={onConfirmDelete}
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Xác nhận xóa
            </Button>
            <Button
                variant="outline"
                className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest"
                onClick={() => setRoleToDelete(null)}
            >
                Quay lại
            </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
