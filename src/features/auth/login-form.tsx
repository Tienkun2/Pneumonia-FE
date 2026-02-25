"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { login } from "@/store/slices/auth-slice";

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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.string().email({
        message: "Email không hợp lệ.",
    }),
    password: z.string().min(1, {
        message: "Vui lòng nhập mật khẩu.",
    }),
    remember: z.boolean().default(false),
});

export function LoginForm() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const resultAction = await dispatch(login({ email: values.email, password: values.password }));

            if (login.fulfilled.match(resultAction)) {
                // Set cookie for middleware manually to ensure it exists before redirect
                const token = resultAction.payload.token;
                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;

                toast.success("Đăng nhập thành công!");

                // Small delay to ensure cookie is set
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh(); // Force refresh to ensure middleware sees the new state
                }, 100);
            } else {
                toast.error((resultAction.payload as string) || "Đăng nhập thất bại");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        }
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-[hsl(199,89%,48%)]">
                    Chào mừng trở lại
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Đăng nhập để truy cập hệ thống <span className="font-semibold text-primary">Phổi Nhi Đồng</span>
                </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <Input
                                                placeholder="bacsi@phoinhidong.com"
                                                className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-11 w-11 px-0 hover:bg-transparent text-muted-foreground hover:text-primary"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between">
                            <FormField
                                control={form.control}
                                name="remember"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm cursor-pointer">
                                            Ghi nhớ tôi
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                            <Button variant="link" size="sm" className="px-0 font-normal h-auto text-primary">
                                Quên mật khẩu?
                            </Button>
                        </div>

                        <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-[hsl(199,89%,48%)] to-[hsl(222.2,47.4%,35%)] hover:opacity-90 border-0" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>

                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-2">Tài khoản demo:</p>
                            <div className="flex justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 bg-white/50 hover:bg-white"
                                    onClick={() => {
                                        form.setValue("email", "admin@cdss.com");
                                        form.setValue("password", "admin");
                                    }}
                                >
                                    Admin
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
