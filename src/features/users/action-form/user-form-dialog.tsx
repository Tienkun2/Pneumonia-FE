"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormValues } from "@/utils/user-schemas";
import { User, CreateUserPayload, UpdateUserPayload } from "@/types/user";
import { useDispatch } from "react-redux";
import { createUser, updateUserThunk } from "@/store/slices/userSlice";
import { AppDispatch } from "@/store/store";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess?: () => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: Readonly<UserFormDialogProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      displayName: "",
      dob: "",
      phoneNumber: "",
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          username: user.username,
          displayName: user.displayName || "",
          dob: user.dob || "",
          phoneNumber: user.phoneNumber || "",
          email: user.email || "",
        });
      } else {
        form.reset({
          username: "",
          displayName: "",
          dob: "",
          phoneNumber: "",
          email: "",
        });
      }
    }
  }, [open, user, dispatch, form]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSaving(true);
    try {
      if (user && user.id) {
          const payload: UpdateUserPayload = {
            username: data.username,
            displayName: data.displayName || undefined,
            dob: data.dob || undefined,
            email: data.email || undefined,
            phoneNumber: data.phoneNumber || undefined,
            status: user.status,
            roles: user.roles?.map(r => r.name) || [],
          };

          await dispatch(updateUserThunk({ id: user.id, payload })).unwrap();
          toast.success("Cập nhật tài khoản thành công!");
      } else {
          const payload: CreateUserPayload = {
            username: data.username,
            email: data.email || "",
            displayName: data.displayName || undefined,
            dob: data.dob || undefined,
          };
          await dispatch(createUser(payload)).unwrap();
          toast.success("Thêm mới tài khoản thành công!");
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{user ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] px-1 overflow-y-auto">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên đăng nhập..." {...field} disabled={!!user} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ và tên..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <PhoneInput placeholder="Nhập SĐT..." {...field} defaultCountry="VN" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Đang lưu..." : "Lưu tài khoản"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
