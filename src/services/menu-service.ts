import { MenuItem } from "@/types/menu";

const MOCK_MENUS: MenuItem[] = [
  {
    id: 1,
    title: "Trang chủ",
    icon: "LayoutDashboard",
    url: "/dashboard",
  },
  {
    id: 2,
    title: "Quản lý hệ thống",
    icon: "Settings",
    items: [
      {
        id: 21,
        title: "Quản trị nhân sự",
        icon: "Users",
        items: [
          {
            id: 211,
            title: "Danh sách người dùng",
            icon: "UserCircle",
            url: "/system/user-management/user-list",
          },
        ],
      },
      {
        id: 22,
        title: "Phân quyền vai trò",
        icon: "ShieldCheck",
        items: [
          {
            id: 221,
            title: "Danh sách vai trò",
            icon: "UserCog",
            url: "/system/role-management/role-list",
          },
          {
            id: 222,
            title: "Danh mục quyền",
            icon: "Key",
            url: "/system/role-management/permission-list",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Quản lý chuyên môn",
    icon: "Stethoscope",
    items: [
      {
        id: 31,
        title: "Hồ sơ bệnh nhân",
        icon: "ClipboardList",
        items: [
          {
            id: 311,
            title: "Danh sách bệnh nhân",
            icon: "Users",
            url: "/medical/patient-mgmt/patient-list",
          },
          {
            id: 312,
            title: "Đăng ký ca bệnh",
            icon: "UserPlus",
            url: "/medical/patient-mgmt/new-registration",
          },
        ],
      },
      {
        id: 32,
        title: "Chẩn đoán hình ảnh",
        icon: "ScanSearch",
        items: [
          {
            id: 321,
            title: "Phân tích X-quang",
            icon: "Activity",
            url: "/medical/ai-diagnosis/analysis",
          },
          {
            id: 322,
            title: "Lịch sử kết quả",
            icon: "History",
            url: "/medical/ai-diagnosis/history",
          },
          {
            id: 323,
            title: "So sánh tiến triển",
            icon: "Layers",
            url: "/medical/ai-diagnosis/comparison",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Tra cứu y khoa",
    icon: "BookOpen",
    items: [
      {
        id: 41,
        title: "Kiến thức chuyên ngành",
        icon: "Library",
        items: [
          {
            id: 411,
            title: "Thư viện bệnh lý",
            icon: "FileText",
            url: "/knowledge/library/clinical-data",
          },
        ],
      },
    ],
  },
];

export const MenuService = {
  async getMenus(): Promise<MenuItem[]> {
    // Để Demo, chúng ta trả về Mock Menu theo cấu trúc mới
    return MOCK_MENUS;

    // Logic thực tế gọi API:
    /*
    const res = await apiClient("/menus/me", { method: "GET" });
    const data: MenuApiResponse = await res.json();
    if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
      throw new Error(data.message || "Failed to fetch menus");
    }
    return data.result;
    */
  },
};
