export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;

export const SESSION_STATUS_MAP = {
  [SESSION_STATUS.ACTIVE]: { label: 'Đang hoạt động', variant: 'success' },
  [SESSION_STATUS.REVOKED]: { label: 'Đã đăng xuất', variant: 'destructive' },
  [SESSION_STATUS.EXPIRED]: { label: 'Hết hạn', variant: 'secondary' },
} as const;
