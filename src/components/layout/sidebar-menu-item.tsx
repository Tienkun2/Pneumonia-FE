import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types/menu";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

interface SidebarMenuItemProps {
  item: MenuItem;
  depth?: number;
  pathname: string;
  isCollapsed?: boolean;
  onClose: () => void;
}

export function SidebarMenuItem({
  item,
  depth = 0,
  pathname,
  isCollapsed = false,
  onClose,
}: SidebarMenuItemProps) {
  const hasChildren = item.items && item.items.length > 0;
  const isActive = !!item.url && pathname === item.url;

  const isChildActive = useCallback(
    (nodes?: MenuItem[]): boolean =>
      nodes?.some((n) => (n.url && pathname.startsWith(n.url)) || isChildActive(n.items)) ?? false,
    [pathname]
  );

  const [isExpanded, setIsExpanded] = useState(() => isChildActive(item.items));

  useEffect(() => {
    if (isChildActive(item.items)) {
      setIsExpanded(true);
    }
  }, [isChildActive, item.items]);

  if (hasChildren) {
    const activeChild = isChildActive(item.items);
    
    return (
      <li className="list-none">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            "flex w-full items-center transition-all duration-200 group rounded-xl",
            isCollapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5",
            activeChild ? "text-primary font-bold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
          title={isCollapsed ? item.title : undefined}
        >
          <DynamicIcon
            name={item.icon}
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              activeChild ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-[14px] truncate">{item.title}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-300 opacity-50",
                  isExpanded && "rotate-90 opacity-100"
                )}
              />
            </>
          )}
        </button>

        {isExpanded && !isCollapsed && (
          <ul className="mt-1 ml-[18px] pl-4 border-l-2 border-primary/10 space-y-1">
            {item.items!.map((child) => (
              <SidebarMenuItem
                key={child.id}
                item={child}
                depth={depth + 1}
                pathname={pathname}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="list-none">
      <Link
        href={item.url!}
        prefetch={false}
        onClick={onClose}
        title={isCollapsed ? item.title : undefined}
        className={cn(
          "flex items-center transition-all duration-200 group",
          isCollapsed 
            ? "justify-center h-11 w-11 mx-auto rounded-xl" 
            : "gap-3 px-3 py-2.5 rounded-xl text-[14px]",
          isActive
            ? (depth === 0 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold" 
                : "text-primary font-extrabold bg-primary/5")
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
        )}
      >
        {/* Chỉ hiện icon ở cấp 0 hoặc khi bị thu nhỏ */}
        {(depth === 0 || isCollapsed) && (
          <DynamicIcon
            name={item.icon}
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isActive ? (depth === 0 ? "text-primary-foreground" : "text-primary") : "text-muted-foreground group-hover:text-foreground"
            )}
          />
        )}
        {!isCollapsed && (
          <span className={cn(
            "truncate transition-all",
            depth > 0 && "pl-0.5"
          )}>
            {item.title}
          </span>
        )}
        {isActive && depth > 0 && !isCollapsed && (
             <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </Link>
    </li>
  );
}
