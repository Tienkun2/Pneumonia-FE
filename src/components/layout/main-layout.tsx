"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { readonly children: React.ReactNode }) {
   const breadcrumbs = useBreadcrumb();
   const [isCollapsed, setIsCollapsed] = useState(false);

   return (
      <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
         <Sidebar isCollapsed={isCollapsed} />
         <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
            <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Breadcrumbs Navigation - Responsive & Premium */}
            <nav className="flex items-center px-4 sm:px-8 py-3 sm:py-4 overflow-x-auto whitespace-nowrap bg-background/50 backdrop-blur-md border-b border-border shadow-sm scrollbar-none">
               <ol className="flex items-center gap-2">
                  {breadcrumbs.map((item, index) => {
                     const isLast = index === breadcrumbs.length - 1;
                     const isHome = index === 0;

                     return (
                        <li key={item.href} className="flex items-center gap-2">
                           {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />}
                           <div
                              className={cn(
                                 "text-xs sm:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap select-none",
                                 isLast ? "text-primary" : "text-muted-foreground"
                              )}
                           >
                              {isHome && <Home className="h-3.5 w-3.5 shrink-0" />}
                              {item.label}
                           </div>
                        </li>
                     );
                  })}
               </ol>
            </nav>

            <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
               <div className="mx-auto max-w-7xl w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {children}
               </div>
            </main>
         </div>
      </div>
   );
}
