import { UserFormDialog } from "../action-form/user-form-dialog";
import { UserRoleDialog } from "../action-form/user-role-dialog";
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
import { User } from "@/types/user";

interface UserDialogsProps {
  readonly showFormDialog: boolean;
  readonly setShowFormDialog: (val: boolean) => void;
  readonly editingUser: User | null;
  readonly onFormSuccess: () => void;
  readonly showRoleDialog: boolean;
  readonly setShowRoleDialog: (val: boolean) => void;
  readonly roleUser: User | null;
  readonly onRoleSuccess: () => void;
  readonly statusUserToToggle: User | null;
  readonly setStatusUserToToggle: (val: User | null) => void;
  readonly isTogglingStatus: boolean;
  readonly onConfirmToggleStatus: () => void;
  readonly userToDelete: { id: string; username: string } | null;
  readonly setUserToDelete: (val: { id: string; username: string } | null) => void;
  readonly onConfirmDelete: () => void;
}

export function UserDialogs({
  showFormDialog,
  setShowFormDialog,
  editingUser,
  onFormSuccess,
  showRoleDialog,
  setShowRoleDialog,
  roleUser,
  onRoleSuccess,
  statusUserToToggle,
  setStatusUserToToggle,
  isTogglingStatus,
  onConfirmToggleStatus,
  userToDelete,
  setUserToDelete,
  onConfirmDelete,
}: UserDialogsProps) {
  return (
    <>
      <UserFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        user={editingUser}
        onSuccess={onFormSuccess}
      />

      <UserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={roleUser}
        onSuccess={onRoleSuccess}
      />

      <Dialog
        open={!!statusUserToToggle}
        onOpenChange={(open) => !open && setStatusUserToToggle(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl text-center p-8">
          <DialogHeader className="mb-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-lg tracking-tight">Xác nhận thay đổi</DialogTitle>
            <DialogDescription className="text-center font-medium opacity-70">
              Bạn có chắc chắn muốn {statusUserToToggle?.status === "ACTIVE" ? "khóa" : "kích hoạt"} tài khoản{" "}
              <strong className="text-foreground">{statusUserToToggle?.username}</strong> không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              className="h-11 rounded-xl w-full font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20"
              onClick={onConfirmToggleStatus}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xác nhận
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl w-full font-black uppercase text-[11px] tracking-widest"
              onClick={() => setStatusUserToToggle(null)}
            >
                Hủy bỏ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl text-center p-8">
            <DialogHeader className="mb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 animate-pulse">
                <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Cảnh báo xóa!</DialogTitle>
            <DialogDescription className="text-center font-medium opacity-70">
                Tài khoản <strong className="text-foreground">{userToDelete?.username}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
            </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2">
            <Button
                variant="destructive"
                className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest shadow-xl shadow-destructive/20 active:scale-[0.98]"
                onClick={onConfirmDelete}
            >
                Tôi chắc chắn, hãy xóa ngay
            </Button>
            <Button
                variant="outline"
                className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest"
                onClick={() => setUserToDelete(null)}
            >
                Quay lại
            </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
