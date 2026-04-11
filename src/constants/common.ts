export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export const STATUS_OPTIONS = [
  { label: "Đang hoạt động", value: STATUS.ACTIVE },
  { label: "Chờ kích hoạt", value: STATUS.PENDING },
  { label: "Ngừng hoạt động", value: STATUS.INACTIVE },
];
