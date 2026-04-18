import { UserFormDialog } from "../action-form/user-form-dialog";
import { UserRoleDialog } from "../action-form/user-role-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
        <DialogContent className="max-w-sm rounded-[24px] overflow-hidden border-none shadow-2xl p-0">
          <div className="p-8 text-center bg-background">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <DialogHeader className="p-0 mb-6">
              <DialogTitle className="text-center font-black uppercase text-xl tracking-tight">Xác nhận thay đổi</DialogTitle>
              <DialogDescription className="text-center font-medium text-[13px] opacity-70 mt-2">
                Bạn có chắc chắn muốn {statusUserToToggle?.status === "ACTIVE" ? "khóa" : "kích hoạt"} tài khoản{" "}
                <strong className="text-foreground">{statusUserToToggle?.username}</strong> không?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                className="h-12 rounded-xl w-full font-bold text-[13px] shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                onClick={onConfirmToggleStatus}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Tiếp tục
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl w-full font-bold text-[13px] border-border/50 transition-all active:scale-[0.98]"
                onClick={() => setStatusUserToToggle(null)}
              >
                  Hủy bỏ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <DialogContent className="max-w-sm rounded-[24px] overflow-hidden border-none shadow-2xl p-0">
          <div className="p-8 text-center bg-background">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 animate-pulse">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <DialogHeader className="p-0 mb-6">
              <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Cảnh báo xóa!</DialogTitle>
              <DialogDescription className="text-center font-medium text-[13px] opacity-70 mt-2">
                  Tài khoản <strong className="text-foreground">{userToDelete?.username}</strong> sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                  variant="destructive"
                  className="h-12 rounded-xl w-full font-bold text-[13px] shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all"
                  onClick={onConfirmDelete}
              >
                  Tôi chắc chắn, hãy xóa ngay
              </Button>
              <Button
                  variant="outline"
                  className="h-12 rounded-xl w-full font-bold text-[13px] border-border/50 active:scale-[0.98] transition-all"
                  onClick={() => setUserToDelete(null)}
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
