"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { usePathname } from "next/navigation";

import { AuthInitializer } from "@/components/layout/auth-initializer";
import { CommandPalette } from "@/components/layout/command-palette";

export function AppProvider({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <Provider store={store}>
      <AuthInitializer>
        {isAuthPage ? children : <MainLayout>{children}</MainLayout>}
        <Toaster position="top-center" richColors />
        {!isAuthPage && <CommandPalette />}
      </AuthInitializer>
    </Provider>
  );
}