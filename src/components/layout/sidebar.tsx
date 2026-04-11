"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarMenuItem } from "./sidebar-menu-item";
import { useMenus } from "@/hooks/use-menus";
import Image from "next/image";
import Link from "next/link";

const SKELETON_WIDTHS = ["75%", "90%", "65%", "80%", "85%", "70%"];

export function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { menus, isLoading } = useMenus();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-[12px] left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border/50 shadow-sm transition-all duration-300 lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "bg-sidebar text-sidebar-foreground flex flex-col"
        )}
      >
        {/* Logo Header */}
        <div className={cn("flex h-20 shrink-0 items-center border-b border-border/10 justify-center", isCollapsed ? "px-2" : "px-6")}>
          <Link href="/dashboard" className="flex items-center justify-center w-full group">
            <div className={cn("relative flex items-center justify-center shrink-0 transition-all duration-500 ease-in-out", isCollapsed ? "h-12 w-12" : "h-16 w-full max-w-[180px]")}>
               <Image 
                 src="/images/PlumoX_Logo.png" 
                 alt="PlumoX" 
                 fill 
                 className="object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.02)] transition-transform duration-500 group-hover:scale-105 dark:invert dark:hue-rotate-180"
                 unoptimized
                 priority
               />
            </div>
          </Link>
        </div>

        {/* Dynamic Navigation */}
        <nav className={cn("flex-1 overflow-y-auto py-4 scrollbar-none", isCollapsed ? "px-2" : "px-4")}>
          {isLoading ? (
            <div className="space-y-1.5 px-0">
              {SKELETON_WIDTHS.map((w, i) => (
                <div key={i} className="h-11 rounded-full bg-muted/60 animate-pulse" style={{ width: w }} />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center pt-8 font-medium">
              Không có menu nào.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {menus.map((item) => (
                <SidebarMenuItem
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </ul>
          )}
        </nav>

        {/* Footer Toggle */}
        <div className={cn("shrink-0", isCollapsed ? "p-3" : "p-5")}>
          <div
            onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "bg-muted/40 border border-border/50 flex cursor-pointer hover:bg-muted/60 transition-colors group",
              isCollapsed ? "rounded-xl flex-col items-center justify-center p-3 gap-2" : "rounded-2xl p-4 items-center justify-between"
            )}
            title={isCollapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shadow-sm shrink-0">
                {!mounted ? (
                  <div className="h-4 w-4" />
                ) : theme === "dark" ? (
                  <Moon className="h-4 w-4 text-primary" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-bold text-foreground animate-in fade-in duration-300">
                  {!mounted ? "Giao diện" : (theme === "dark" ? "Dark mode" : "Light mode")}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-colors duration-300 flex items-center animate-in fade-in duration-300",
                  !mounted ? "bg-slate-200 justify-start" : (theme === "dark" ? "bg-primary justify-end" : "bg-slate-200 justify-start")
                )}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
