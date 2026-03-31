"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActivateForm } from "@/hooks/useActivateForm";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function ActivateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) {
      setToken(t);
      router.replace("/auth/activate");
    }
  }, [searchParams, router]);

  const { form, onSubmit, isLoading } = useActivateForm(token);

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary">
          Kích hoạt tài khoản
        </h2>
        <p className="text-sm text-muted-foreground">
          Vui lòng đặt mật khẩu để hoàn tất đăng ký
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* PASSWORD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 h-11 bg-muted/50 border-border focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all ${
                          form.formState.errors.password
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        {...field}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 w-11"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  {form.watch("password") && <FormMessage />}
                </FormItem>
              )}
            />
              {/* CONFIRM PASSWORD */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 h-11 bg-muted/50 border-border focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all ${
                          form.formState.errors.confirmPassword
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        {...field}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 w-11"
                        onClick={() =>
                          setShowConfirm(!showConfirm)
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>

                  {/* Error */}
                  {form.watch("confirmPassword") && <FormMessage />}
                </FormItem>
              )}
            />

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Kích hoạt"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}