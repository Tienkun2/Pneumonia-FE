"use client";

import { PatientFormDialog } from "../action-form/patient-form-dialog";
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
import { Patient } from "@/types/patient";

interface PatientDialogsProps {
  readonly showFormDialog: boolean;
  readonly setShowFormDialog: (val: boolean) => void;
  readonly editingPatient: Patient | null;
  readonly onFormSuccess: () => void;
  readonly patientToDelete: Patient | null;
  readonly setPatientToDelete: (val: Patient | null) => void;
  readonly isDeleting: boolean;
  readonly onConfirmDelete: () => void;
}

export function PatientDialogs({
  showFormDialog,
  setShowFormDialog,
  editingPatient,
  onFormSuccess,
  patientToDelete,
  setPatientToDelete,
  isDeleting,
  onConfirmDelete,
}: PatientDialogsProps) {
  return (
    <>
      <PatientFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        patient={editingPatient}
        onSuccess={onFormSuccess}
      />

      <Dialog
        open={!!patientToDelete}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl text-center p-8 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 animate-pulse">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Xác nhận xóa!</DialogTitle>
            <DialogDescription className="text-center font-medium opacity-70">
              Hồ sơ bệnh nhân <strong className="text-foreground">{patientToDelete?.fullName}</strong> sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="destructive"
              className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest shadow-xl shadow-destructive/20 active:scale-[0.98]"
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xác nhận xóa
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl w-full font-black uppercase text-[12px] tracking-widest"
              onClick={() => setPatientToDelete(null)}
            >
              Quay lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
