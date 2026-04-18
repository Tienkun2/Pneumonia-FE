import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Trang chủ",
  profile: "Thông tin cá nhân",
  system: "Quản lý hệ thống",
  "user-management": "Quản trị nhân sự",
  "user-list": "Danh sách người dùng",
  "role-management": "Phân quyền vai trò",
  "role-list": "Danh sách vai trò",
  "permission-list": "Danh sách quyền",
  medical: "Quản lý y tế",
  "patient-mgmt": "Quản lý bệnh nhân",
  "patient-list": "Danh sách bệnh nhân",
  "ai-diagnosis": "Chẩn đoán AI",
  "analysis": "Phân tích chẩn đoán",
  "history": "Lịch sử chẩn đoán",
  "comparison": "So sánh chẩn đoán",
  "settings": "Cài đặt hệ thống",
  knowledge: "Thư viện y khoa",
  "library": "Thư viện y khoa",
  "clinical-data": "Dữ liệu lâm sàng",
  "notifications": "Thông báo",
};

export function useBreadcrumb(): BreadcrumbItem[] {
  const pathname = usePathname();
  const selectedPatient = useSelector((state: RootState) => state.patient?.selectedPatient);

  const breadcrumbs = useMemo(() => {
    // Remove query parameters or hash from url
    const asPathWithoutQuery = pathname.split("?")[0];

    // Split pathname into segments 
    const pathSegments = asPathWithoutQuery.split("/").filter((v) => v.length > 0);

    // Initial breadcrumb element (Always start with Home)
    const breadcrumbArray: BreadcrumbItem[] = [
      { label: "Trang chủ", href: "/dashboard" }
    ];

    if (pathSegments.length === 0) {
        return breadcrumbArray;
    }

    // Build the path up for each segment
    let currentLink = "";
    pathSegments.forEach((segment) => {
      if (segment === "dashboard") return;
      
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
