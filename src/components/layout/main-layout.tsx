"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function MainLayout({ children }: { readonly children: React.ReactNode }) {
  const breadcrumbs = useBreadcrumb();

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        
        {/* Breadcrumbs Navigation - Premium Underline Style */}
        <nav className="flex items-center px-8 py-4 overflow-x-auto whitespace-nowrap bg-background/50 backdrop-blur-md border-b border-border shadow-sm">
           <ol className="flex items-center gap-2">
              {breadcrumbs.map((item, index) => {
                 const isLast = index === breadcrumbs.length - 1;
                 const isHome = index === 0;

                 return (
                    <li key={item.href} className="flex items-center gap-2">
                       {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                       <Link 
                         href={item.href}
                         className={`text-sm font-semibold transition-all flex items-center gap-1.5 ${isLast ? "text-primary pointer-events-none" : "text-muted-foreground hover:text-primary hover:scale-[1.02]"}`}
                       >
                          {isHome && <Home className="h-3.5 w-3.5" />}
                          {item.label}
                       </Link>
                    </li>
                 );
              })}
           </ol>
        </nav>

        <main className="p-8 flex-1">
           <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
