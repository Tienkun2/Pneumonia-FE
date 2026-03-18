"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema, RoleFormValues } from "@/untils/user-schemas";
import { User, UpdateUserPayload } from "@/types/user";
import { useDispatch, useSelector } from "react-redux";
import { updateUserThunk } from "@/store/slices/userSlice";
import { fetchRoles } from "@/store/slices/roleSlice";
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Phân quyền người dùng</DialogTitle>
          <DialogDescription>
            {user ? `Chọn các quyền bảo mật cho tài khoản ${user.username}.` : "Đang tải dữ liệu..."}
          </DialogDescription>
        </DialogHeader>

        {rolesLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="roles"
                render={() => (
                    <FormItem>
                    {apiRoles.map((role) => (
                        <FormField
                        key={role.name}
                        control={form.control}
                        name="roles"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={role.name}
                                className="flex flex-row items-start space-x-3 space-y-0 py-2 border-b border-gray-50 last:border-0"
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
                                />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="font-medium">
                                        {role.name}
                                    </FormLabel>
                                    <p className="text-sm border-l-2 pl-2 text-muted-foreground">
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

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isSaving}>
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
