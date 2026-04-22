export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export const USER_STATUS_OPTIONS = [
  { label: "Đang hoạt động", value: USER_STATUS.ACTIVE },
  { label: "Chờ kích hoạt", value: USER_STATUS.PENDING },
  { label: "Ngừng hoạt động", value: USER_STATUS.INACTIVE },
];

export const USER_COLUMN_LABELS = {
  username: "Tên đăng nhập",
  displayName: "Họ và tên",
  email: "Email",
  phoneNumber: "Số điện thoại",
  status: "Trạng thái",
  roles: "Vai trò",
  createdAt: "Ngày tạo",
  STT: "STT",
  deviceCount: "Số thiết bị",
  sessionCount: "Tổng phiên",
};
