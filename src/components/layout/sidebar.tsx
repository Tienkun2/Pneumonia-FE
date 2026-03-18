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
  { title: "Kiến thức y khoa", href: "/knowledge", icon: BookOpen },
  { title: "Cài đặt", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
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
          "fixed left-0 top-0 z-40 h-screen w-64 transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "bg-blue-600 text-white"
        )}
      >
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="flex h-20 items-center px-6 border-b border-blue-500">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Phổi Nhi Đồng
                </h2>
                <span className="text-xs text-blue-100">
                  1 - 5 Tuổi
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
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-blue-100 hover:bg-blue-500 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}

                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-blue-600" : "text-blue-200"
                    )}
                  />

                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-500">
            <div className="bg-blue-500/30 rounded-lg p-4">
              <p className="text-xs text-blue-100 mb-2">
                Trạng thái hệ thống
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-white">
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