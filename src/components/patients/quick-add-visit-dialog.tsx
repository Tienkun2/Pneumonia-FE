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
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { Textarea } from "@/components/ui/textarea";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createVisitThunk, updateVisitThunk } from "@/store/slices/visitSlice";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Visit } from "@/types/visit";

const visitSchema = z.object({
  symptoms: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof visitSchema>;

interface QuickAddVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: () => void;
  visit?: Visit | null;
}

export function QuickAddVisitDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess,
  visit,
}: QuickAddVisitDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!visit;
  
  const form = useForm<FormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      symptoms: "",
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (visit) {
        form.reset({
          symptoms: visit.symptoms || "",
          note: visit.note || "",
        });
      } else {
        form.reset({
          symptoms: "",
          note: "",
        });
      }
    }
  }, [open, visit, form]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsPending(true);
      const payload = {
        patientId,
        symptoms: data.symptoms || undefined,
        note: data.note || undefined,
      };
      
      if (isEditing) {
        // Exclude patientId if the API doesn't need it, though payload allows it.
        const updatePayload = {
          symptoms: data.symptoms || undefined,
          note: data.note || undefined,
        };
        await dispatch(updateVisitThunk({ id: visit!.id, payload: updatePayload })).unwrap();
        toast.success("Cập nhật lượt khám thành công");
      } else {
        await dispatch(createVisitThunk(payload)).unwrap();
        toast.success("Thêm lượt khám thành công");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(typeof error === "string" ? error : "Có lỗi xảy ra");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật lượt khám" : "Tạo lượt khám mới"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Chỉnh sửa triệu chứng và ghi chú." : "Ghi nhận triệu chứng và ghi chú ban đầu cho bệnh nhân."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Triệu chứng (Symptoms)</Label>
              <Textarea
                id="symptoms"
                {...form.register("symptoms")}
                placeholder="Ho khan dai dẳng, sốt trên 39 độ..."
                rows={3}
              />
              <FormError message={form.formState.errors.symptoms?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú (Note)</Label>
              <Textarea
                id="note"
                {...form.register("note")}
                placeholder="Tiền sử viêm phế quản..."
                rows={3}
              />
              <FormError message={form.formState.errors.note?.message} />
            </div>
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
              {isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
