import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
    title: "Đăng nhập | Hệ thống Hỗ trợ Chẩn đoán CDSS",
    description: "Đăng nhập vào hệ thống CDSS",
};

export default function LoginPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

            {/* Left side - Premium Pediatric Branding */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900">
                    {/* Deep Medical Teal Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(199,89%,48%)] to-[hsl(222.2,47.4%,20%)] opacity-95" />
                    {/* Decorative Circles */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl opacity-30" />

                    <Image
                        src="/images/background.png"
                        alt="Medical background"
                        fill
                        className="object-cover opacity-10 mix-blend-overlay"
                        priority
                    />
                </div>
                <div className="relative z-20 flex items-center gap-3 text-lg font-medium">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white"
                        >
                            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3" />
                            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                            <circle cx="20" cy="10" r="2" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-none">Phổi Nhi Đồng</h1>
                        <p className="text-xs text-blue-100/80 font-medium tracking-wide mt-0.5">CHUYÊN KHOA 1-5 TUỔI</p>
                    </div>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-4">
                        <p className="text-xl font-light italic leading-relaxed text-blue-50">
                            &ldquo;Chăm sóc hơi thở cho trẻ là sứ mệnh của chúng tôi. Hệ thống CDSS hỗ trợ bác sĩ đưa ra quyết định chính xác nhất.&rdquo;
                        </p>
                        <footer className="text-sm font-semibold flex items-center gap-2">
                            <div className="h-0.5 w-8 bg-white/50" />
                            Bệnh viện Đa khoa Quốc tế
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <LoginForm />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Bằng cách tiếp tục, bạn đồng ý với{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Điều khoản dịch vụ
                        </Link>{" "}
                        và{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Chính sách bảo mật
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
