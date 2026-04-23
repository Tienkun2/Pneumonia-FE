export const DEVICE_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
} as const;

export const DEVICE_STATUS_MAP = {
  [DEVICE_STATUS.ACTIVE]: { label: 'Đang hoạt động', variant: 'success' },
  [DEVICE_STATUS.REVOKED]: { label: 'Bị thu hồi', variant: 'destructive' },
} as const;
