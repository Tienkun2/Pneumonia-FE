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
