"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { permissionSchema, PermissionFormValues } from "@/utils/permission-schemas";
import { PermissionService } from "@/services/permission-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
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
import { MODAL_STYLES, FORM_STYLES } from "@/constants/styles";

interface PermissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentName?: string;
  onSuccess?: () => void;
}

export function PermissionFormDialog({ open, onOpenChange, parentName, onSuccess }: Readonly<PermissionFormDialogProps>) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: "", description: "" });
    }
  }, [open, form]);

  const onSubmit = async (data: PermissionFormValues) => {
    setIsSaving(true);
    try {
      await PermissionService.createPermission({
        ...data,
        parentName: parentName || undefined,
      });
      toast.success("Thêm quyền mới thành công!");
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
          <DialogTitle className={MODAL_STYLES.title}>Thêm quyền mới</DialogTitle>
          {parentName && (
            <DialogDescription className={MODAL_STYLES.description}>
              Thuộc nhóm: <span className="font-semibold text-foreground">{parentName}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={MODAL_STYLES.body}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={FORM_STYLES.label}>
                    Mã quyền <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: SYST_ROOT, USER_READ..."
                      {...field}
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
                      placeholder="Mô tả chức năng của quyền này..."
                      rows={3}
                      {...field}
                      className={FORM_STYLES.input}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={MODAL_STYLES.footer + " -mx-6 -mb-5 mt-1 px-6 py-4"}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={FORM_STYLES.buttonSecondary}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} className={FORM_STYLES.buttonPrimary}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isSaving ? "Đang lưu..." : "Lưu lại"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
