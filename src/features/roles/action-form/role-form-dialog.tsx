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
import { Loader2 } from "lucide-react";
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
      if (role) {
        form.reset({
          name: role.name,
          description: role.description || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, role, form]);

  const onSubmit = async (data: RoleFormValues) => {
    setIsSaving(true);
    try {
      if (role) {
        // Update
        await RoleService.updateRole(role.name, {
            description: data.description,
            permissions: role.permissions?.map(p => p.name) || []
        });
        toast.success("Cập nhật vai trò thành công!");
      } else {
        // Create
        await RoleService.createRole({
            ...data,
            permissions: []
        });
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
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 border-b border-border/40 bg-muted/10 text-left">
          <DialogTitle className="text-lg font-black uppercase tracking-tight">
            {role ? "Cập nhật thông tin" : "Thêm vai trò mới"}
          </DialogTitle>
          <DialogDescription className="font-medium text-[13px]">
            Chỉnh sửa các thông tin cơ bản của vai trò và mô tả nghiệp vụ.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-8 bg-background">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Tên vai trò <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Ví dụ: ADMIN, DOCTOR..." 
                        {...field} 
                        disabled={!!role} 
                        className="h-11 rounded-xl border-border/50 font-bold focus:ring-primary/20 text-[13px]"
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
                  <FormLabel className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Mô tả nghiệp vụ
                  </FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Nhập mô tả cho vai trò này..." 
                        {...field} 
                        className="h-11 rounded-xl border-border/50 font-medium focus:ring-primary/20 text-[13px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40 bg-muted/5 -mx-8 -mb-8 p-8">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-xl font-bold flex-1 border-border/50 text-[13px]">
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} className="h-10 rounded-xl font-bold flex-1 bg-primary text-white shadow-lg shadow-primary/20 text-[13px]">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Đang lưu..." : role ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
