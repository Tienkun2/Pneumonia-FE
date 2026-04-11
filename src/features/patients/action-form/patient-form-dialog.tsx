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
        // Update
        const updatePayload: Partial<PatientFormValues> = { ...payload };
        delete updatePayload.code; // Don't update code

        await dispatch(updatePatientThunk({ id: patient.id, payload: updatePayload })).unwrap();
        toast.success("Cập nhật bệnh nhân thành công!");
      } else {
        // Create
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
      <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 border-b border-border/40 bg-muted/10 text-left">
          <DialogTitle className="text-lg font-black uppercase tracking-tight">
            {patient ? "Cập nhật hồ sơ" : "Thêm bệnh nhân mới"}
          </DialogTitle>
          <DialogDescription className="font-medium text-[13px]">
            {patient ? "Chỉnh sửa thông tin bệnh nhân." : "Nhập thông tin cơ bản của bệnh nhân."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-8 bg-background max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        Mã bệnh nhân <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="BN-001" {...field} disabled={!!patient} className="h-11 rounded-xl border-border/50 font-bold focus:ring-primary/20 text-[13px]" />
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
                    <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        Họ và tên <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} className="h-11 rounded-xl border-border/50 font-bold focus:ring-primary/20 text-[13px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-11 rounded-xl border-border/50 font-medium focus:ring-primary/20 text-[13px]" />
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
                    <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        Giới tính <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl border-border/50 font-medium focus:ring-primary/20 text-[13px]">
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

              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Tên người giám hộ</FormLabel>
                    <FormControl>
                      <Input placeholder="Trần Thị B" {...field} className="h-11 rounded-xl border-border/50 font-medium focus:ring-primary/20 text-[13px]" />
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
                    <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Số điện thoại</FormLabel>
                    <FormControl>
                      <PhoneInput placeholder="0987xxx..." {...field} defaultCountry="VN" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập địa chỉ..." {...field} className="h-11 rounded-xl border-border/50 font-medium focus:ring-primary/20 text-[13px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6 border-t border-border/40 bg-muted/5 -mx-8 -mb-8 p-8">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-xl font-bold flex-1 border-border/50 text-[13px]">
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} className="h-10 rounded-xl font-bold flex-1 bg-primary text-white shadow-lg shadow-primary/20 text-[13px]">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Đang lưu..." : patient ? "Cập nhật" : "Thêm bệnh nhân"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
