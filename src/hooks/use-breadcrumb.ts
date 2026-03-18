import { usePathname } from "next/navigation";
import { useMemo } from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Tổng quan",
  users: "Quản lý Tài khoản",
  auth: "Xác thực",
  login: "Đăng nhập",
  register: "Tạo tài khoản",
  activate: "Kích hoạt tài khoản",
  "forgot-password": "Quên mật khẩu",
};

export function useBreadcrumb(): BreadcrumbItem[] {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Remove query parameters or hash from url
    const asPathWithoutQuery = pathname.split("?")[0];

    // Split pathname into segments 
    const pathSegments = asPathWithoutQuery.split("/").filter((v) => v.length > 0);

    // Initial breadcrumb element (Home)
    const breadcrumbArray: BreadcrumbItem[] = [
      {
        label: "Trang chủ",
        href: "/",
      },
    ];

    // Build the path up for each segment
    let currentLink = "";
    pathSegments.forEach((segment) => {
      currentLink += `/${segment}`;

      breadcrumbArray.push({
        label: ROUTE_LABELS[segment] || segment, // fallback to segment name if not in dictionary
        href: currentLink,
      });
    });

    return breadcrumbArray;
  }, [pathname]);

  return breadcrumbs;
}
