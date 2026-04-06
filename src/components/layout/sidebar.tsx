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

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const menuGroups = [
  {
    heading: "Main Menu",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    heading: "Others menu",
    items: [
      { title: "Bệnh nhân", href: "/patients", icon: Users },
      { title: "Tài khoản", href: "/users", icon: UserCog },
      { title: "Chẩn đoán", href: "/diagnosis", icon: Stethoscope },
      { title: "Kết quả", href: "/results", icon: FileText },
      { title: "So sánh tiến triển", href: "/comparison", icon: ArrowLeftRight },
      { title: "Kiến thức y khoa", href: "/knowledge", icon: BookOpen },
    ]
  },
  {
    heading: "Help & Setting",
    items: [
      { title: "Cài đặt", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Mobile button */}
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
          "fixed left-0 top-0 z-40 h-screen w-64 transition-transform duration-300 lg:translate-x-0 border-r border-border/50 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "bg-sidebar text-sidebar-foreground flex flex-col"
        )}
      >
        {/* Header Logo */}
        <div className="flex h-20 shrink-0 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                Care DR.
              </h2>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Medical Admin
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                {group.heading}
              </h4>
              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-full px-4 py-3 text-[14px] font-semibold transition-all duration-200",
                          isActive
                            ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-white" : "text-muted-foreground"
                          )}
                        />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer (Status) */}
        <div className="p-5 shrink-0">
          <div 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-2xl p-4 bg-muted/40 border border-border/50 flex items-center justify-between cursor-pointer hover:bg-muted/60 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shadow-sm">
                {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-500" />}
              </div>
              <span className="text-sm font-bold text-foreground">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </span>
            </div>
            <div className={cn(
              "w-10 h-6 rounded-full p-1 transition-colors duration-300 flex items-center",
              theme === "dark" ? "bg-primary justify-end" : "bg-slate-200 justify-start"
            )}>
              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}