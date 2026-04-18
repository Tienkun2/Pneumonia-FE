"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormValues } from "@/utils/patient-schemas";
import { Patient } from "@/types/patient";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createPatientThunk, updatePatientThunk } from "@/store/slices/patient-slice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODAL_STYLES, FORM_STYLES } from "@/utils/styles";

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSuccess?: () => void;
}

export function PatientFormDialog({ open, onOpenChange, patient, onSuccess }: Readonly<PatientFormDialogProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PatientFormValues>({
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
      form.reset({
        code: patient?.code ?? "",
        fullName: patient?.fullName ?? "",
        dateOfBirth: patient?.dateOfBirth?.split("T")[0] ?? "",
        gender: patient?.gender ?? "MALE",
        guardianName: patient?.guardianName ?? "",
        phone: patient?.phone ?? "",
        address: patient?.address ?? "",
      });
    }
  }, [open, patient, form]);

  const onSubmit = async (data: PatientFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        dateOfBirth: data.dateOfBirth || undefined,
        guardianName: data.guardianName || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      };

      if (patient) {
        const updatePayload: Partial<PatientFormValues> = { ...payload };
        delete updatePayload.code;
        await dispatch(updatePatientThunk({ id: patient.id, payload: updatePayload })).unwrap();
        toast.success("Cập nhật bệnh nhân thành công!");
      } else {
        await dispatch(createPatientThunk(payload)).unwrap();
        toast.success("Thêm bệnh nhân thành công!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = typeof error === "string" ? error : "Có lỗi xảy ra";
      if (errorMessage.includes("5001") || errorMessage.includes("already exists")) {
        form.setError("code", { message: "Mã bệnh nhân đã tồn tại" });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_STYLES.contentWide}>
        <DialogHeader className={MODAL_STYLES.header}>
          <DialogTitle className={MODAL_STYLES.title}>
            {patient ? "Cập nhật hồ sơ" : "Thêm bệnh nhân mới"}
          </DialogTitle>
          <DialogDescription className={MODAL_STYLES.description}>
            {patient ? "Chỉnh sửa thông tin bệnh nhân." : "Nhập thông tin cơ bản của bệnh nhân."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={MODAL_STYLES.bodyWithScroll}>
            {/* Row 1: Mã BN + Họ tên */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORM_STYLES.label}>
                      Mã bệnh nhân <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="BN-001"
                        {...field}
                        disabled={!!patient}
                        className={FORM_STYLES.inputBold}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORM_STYLES.label}>
                      Họ và tên <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nguyễn Văn A"
                        {...field}
                        className={FORM_STYLES.inputBold}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Ngày sinh + Giới tính */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORM_STYLES.label}>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className={FORM_STYLES.input} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORM_STYLES.label}>
                      Giới tính <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={FORM_STYLES.input}>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Người giám hộ + SĐT */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORM_STYLES.label}>Tên người giám hộ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Trần Thị B"
                        {...field}
                        className={FORM_STYLES.input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORM_STYLES.label}>Số điện thoại</FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder="0987xxx..."
                        {...field}
                        defaultCountry="VN"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4: Địa chỉ (full width) */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={FORM_STYLES.label}>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập địa chỉ..."
                      {...field}
                      className={FORM_STYLES.input}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={MODAL_STYLES.footer + " -mx-6 -mb-5 mt-1"}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={FORM_STYLES.buttonSecondary}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} className={FORM_STYLES.buttonPrimary}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Đang lưu..." : patient ? "Cập nhật" : "Thêm bệnh nhân"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
