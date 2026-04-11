"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createPatientThunk, updatePatientThunk } from "@/store/slices/patient-slice";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Patient } from "@/types/patient";
import { PhoneInput } from "@/components/ui/phone-input";

const patientSchema = z.object({
  code: z.string().min(1, "Mã bệnh nhân là bắt buộc"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  guardianName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof patientSchema>;

interface QuickAddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  patient?: Patient | null;
}

export function QuickAddPatientDialog({
  open,
  onOpenChange,
  onSuccess,
  patient,
}: QuickAddPatientDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!patient;

  const form = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      code: "",
      fullName: "",
      dateOfBirth: "",
      gender: "MALE",
      guardianName: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (patient) {
        form.reset({
          code: patient.code,
          fullName: patient.fullName,
          dateOfBirth: patient.dateOfBirth?.split("T")[0] || "",
          gender: patient.gender,
          guardianName: patient.guardianName || "",
          phone: patient.phone || "",
          address: patient.address || "",
        });
      } else {
        form.reset({
          code: "",
          fullName: "",
          dateOfBirth: "",
          gender: "MALE",
          guardianName: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [open, patient, form]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsPending(true);
      const payload = {
        ...data,
        dateOfBirth: data.dateOfBirth || undefined,
        guardianName: data.guardianName || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      };

      if (isEditing) {
        // Exclude code in update according to API spec (Không được cập nhật mã bệnh nhân)
        const updatePayload: Partial<FormData> = { ...payload };
        delete updatePayload.code;

        await dispatch(updatePatientThunk({ id: patient!.id, payload: updatePayload })).unwrap();
        toast.success("Cập nhật bệnh nhân thành công");
      } else {
        await dispatch(createPatientThunk(payload)).unwrap();
        toast.success("Thêm bệnh nhân thành công");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = typeof error === "string" ? error : "Có lỗi xảy ra";
      if (errorMessage.includes("5001") || errorMessage.includes("already exists")) {
        form.setError("code", { message: "Mã bệnh nhân đã tồn tại" });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật thông tin" : "Thêm bệnh nhân mới"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Chỉnh sửa thông tin bệnh nhân." : "Nhập thông tin cơ bản của bệnh nhân."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã bệnh nhân *</Label>
              <Input
                id="code"
                {...form.register("code")}
                placeholder="BN-001"
                disabled={isEditing}
              />
              <FormError message={form.formState.errors.code?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Họ tên *</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                placeholder="Nguyễn Văn A"
              />
              <FormError message={form.formState.errors.fullName?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...form.register("dateOfBirth")}
              />
              <FormError message={form.formState.errors.dateOfBirth?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính *</Label>
              <Select
                value={form.watch("gender")}
                onValueChange={(value) =>
                  form.setValue("gender", value as "MALE" | "FEMALE" | "OTHER")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianName">Tên người giám hộ</Label>
              <Input
                id="guardianName"
                {...form.register("guardianName")}
                placeholder="Trần Thị B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <PhoneInput
                id="phone"
                value={form.watch("phone")}
                onChange={(value: string | undefined) => form.setValue("phone", value ?? "")}
                placeholder="0987654321"
                defaultCountry="VN"
              />
              <FormError message={form.formState.errors.phone?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              {...form.register("address")}
              placeholder="Hà Nội"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm bệnh nhân"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
