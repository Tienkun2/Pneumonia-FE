import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
  profile: "Hồ sơ cá nhân",
  "forgot-password": "Quên mật khẩu",
  patients: "Quản lý Bệnh nhân",
  diagnosis: "Thực hiện Chẩn đoán",
  results: "Lịch sử Kết quả",
  comparison: "So sánh Tiến triển",
  knowledge: "Thư viện Y khoa",
  settings: "Cài đặt hệ thống",
  notifications: "Thông báo",
};

export function useBreadcrumb(): BreadcrumbItem[] {
  const pathname = usePathname();
  const selectedPatient = useSelector((state: RootState) => state.patient?.selectedPatient);

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

      let label = ROUTE_LABELS[segment] || segment;

      if (segment === selectedPatient?.id) {
        label = selectedPatient.code;
      }

      breadcrumbArray.push({
        label,
        href: currentLink,
      });
    });

    return breadcrumbArray;
  }, [pathname, selectedPatient]);

  return breadcrumbs;
}
