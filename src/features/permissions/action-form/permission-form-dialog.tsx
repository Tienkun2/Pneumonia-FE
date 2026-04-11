"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { permissionSchema, PermissionFormValues } from "@/utils/permission-schemas";
import { PermissionService } from "@/services/permission-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      form.reset({
        name: "",
        description: "",
      });
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
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 border-b border-border/40 bg-muted/10 text-left">
          <DialogTitle className="text-lg font-black uppercase tracking-tight">Thêm quyền mới</DialogTitle>
          <DialogDescription className="font-medium text-[13px]">
            Khởi tạo một mã định danh quyền truy cập mới trong hệ thống.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-8 bg-background">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Mã quyền <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SYST_ROOT, USER_READ..." {...field} className="h-11 rounded-xl border-border/50 font-bold text-[13px]" />
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
                  <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Mô tả nghiệp vụ
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả chức năng của quyền này..." {...field} className="h-11 rounded-xl border-border/50 font-medium text-[13px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40 bg-muted/5 -mx-8 -mb-8 p-8">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-xl flex-1 font-bold">
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} className="h-10 rounded-xl flex-1 bg-primary text-white shadow-lg shadow-primary/20 font-bold">
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Plus className="h-3.5 w-3.5 mr-2" />}
                Lưu lại
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
