"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema, RoleFormValues } from "@/utils/user-schemas";
import { User, UpdateUserPayload } from "@/types/user";
import { useDispatch, useSelector } from "react-redux";
import { updateUserThunk } from "@/store/slices/user-slice";
import { fetchRoles } from "@/store/slices/role-slice";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Checkbox } from "@/components/ui/checkbox";


import { MODAL_STYLES, FORM_STYLES } from "@/utils/styles";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function UserRoleDialog({ open, onOpenChange, user, onSuccess }: Readonly<UserRoleDialogProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  
  const { roles: apiRoles, isLoading: rolesLoading } = useSelector((state: RootState) => state.role);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roles: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (apiRoles.length === 0) {
        dispatch(fetchRoles());
      }
      if (user) {
        form.reset({
          roles: user.roles?.map(r => r.name) || [],
        });
      }
    }
  }, [open, user, apiRoles.length, dispatch, form]);

  const onSubmit = async (data: RoleFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const payload: UpdateUserPayload = {
        username: user.username,
        displayName: user.displayName || undefined,
        dob: user.dob || undefined,
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,
        status: user.status,
        roles: data.roles,
      };

      await dispatch(updateUserThunk({ id: user.id, payload })).unwrap();
      toast.success("Cập nhật quyền thành công!");

      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      toast.error((error as string) || "Có lỗi xảy ra khi phân quyền");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_STYLES.content}>
        <DialogHeader className={MODAL_STYLES.header}>
          <DialogTitle className={MODAL_STYLES.title}>Phân quyền người dùng</DialogTitle>
          <DialogDescription className={MODAL_STYLES.description}>
            {user ? `Chọn các vai trò cho tài khoản ${user.username}.` : "Đang tải dữ liệu..."}
          </DialogDescription>
        </DialogHeader>

        {rolesLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={MODAL_STYLES.body}>
                <FormField
                control={form.control}
                name="roles"
                render={() => (
                    <FormItem className="space-y-3">
                    {apiRoles.map((role) => (
                        <FormField
                        key={role.name}
                        control={form.control}
                        name="roles"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={role.name}
                              className="flex flex-row items-start space-x-3 space-y-0 py-3 border-b border-border last:border-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(role.name)}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValues, role.name])
                                        : field.onChange(
                                            currentValues.filter(
                                            (value) => value !== role.name
                                            )
                                        )
                                    }}
                                    className="h-5 w-5 rounded-md border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="font-bold text-[13px] text-foreground">
                                        {role.name}
                                    </FormLabel>
                                    <p className="text-[12px] text-muted-foreground line-clamp-1">
                                        {role.description}
                                    </p>
                                </div>
                            </FormItem>
                            )
                        }}
                        />
                    ))}
                    <FormMessage />
                    </FormItem>
                )}
                />

              <div className={MODAL_STYLES.footer + " -mx-6 -mb-5 mt-1"}>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className={FORM_STYLES.buttonSecondary}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSaving} className={FORM_STYLES.buttonPrimary}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSaving ? "Đang lưu..." : "Lưu phân quyền"}
                  </Button>
                </div>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
