"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  BookOpen,
  Settings,
  Menu,
  X,
  UserCog,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Bệnh nhân", href: "/patients", icon: Users },
  { title: "Tài khoản", href: "/users", icon: UserCog },
  { title: "Chẩn đoán", href: "/diagnosis", icon: Stethoscope },
  { title: "Kết quả", href: "/results", icon: FileText },
  { title: "So sánh tiến triển", href: "/comparison", icon: ArrowLeftRight },
  { title: "Kiến thức y khoa", href: "/knowledge", icon: BookOpen },
  { title: "Cài đặt", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile button - Centered vertically in 64px header */}
      <div className="lg:hidden fixed top-[12px] left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transition-all lg:translate-x-0 border-r border-transparent dark:border-border shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "bg-sidebar text-sidebar-foreground"
        )}
      >
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="flex h-20 items-center px-6 border-b border-blue-500/50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/10 dark:bg-primary/20 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white dark:text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-sidebar-foreground">
                  Chẩn đoán Phổi
                </h2>
                <span className="text-xs text-sidebar-foreground/70">
                  Đa độ tuổi
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground transition-all"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}

                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary-foreground" : "text-sidebar-foreground/60"
                    )}
                  />

                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/20">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-xs text-sidebar-foreground/60 mb-2">
                Trạng thái hệ thống
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-sidebar-foreground">
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}