"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema, RoleFormValues } from "@/utils/role-schemas";
import { Role } from "@/types/role";
import { RoleService } from "@/services/role-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MODAL_STYLES, FORM_STYLES } from "@/utils/styles";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSuccess?: () => void;
}

export function RoleFormDialog({ open, onOpenChange, role, onSuccess }: Readonly<RoleFormDialogProps>) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: role?.name ?? "",
        description: role?.description ?? "",
      });
    }
  }, [open, role, form]);

  const onSubmit = async (data: RoleFormValues) => {
    setIsSaving(true);
    try {
      if (role) {
        await RoleService.updateRole(role.name, {
          description: data.description,
          permissions: role.permissions?.map((p) => p.name) || [],
        });
        toast.success("Cập nhật vai trò thành công!");
      } else {
        await RoleService.createRole({ ...data, permissions: [] });
        toast.success("Thêm vai trò mới thành công!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      toast.error((error as string) || "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_STYLES.content}>
        <DialogHeader className={MODAL_STYLES.header}>
          <DialogTitle className={MODAL_STYLES.title}>
            {role ? "Cập nhật vai trò" : "Thêm vai trò mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={MODAL_STYLES.body}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={FORM_STYLES.label}>
                    Tên vai trò <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: ADMIN, DOCTOR..."
                      {...field}
                      disabled={!!role}
                      className={FORM_STYLES.inputBold}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={FORM_STYLES.label}>Mô tả nghiệp vụ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả cho vai trò này..."
                      rows={3}
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
                {isSaving ? "Đang lưu..." : role ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
