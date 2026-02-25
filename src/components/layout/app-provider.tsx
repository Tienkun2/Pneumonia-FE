"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { usePathname } from "next/navigation";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Check if current path starts with /login
    const isAuthPage = pathname?.startsWith("/login");

    return (
        <Provider store={store}>
            {isAuthPage ? (
                children
            ) : (
                <MainLayout>{children}</MainLayout>
            )}
            <Toaster position="top-center" richColors />
        </Provider>
    );
}
