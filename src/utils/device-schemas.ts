import { z } from "zod";

export const UserDeviceResponseSchema = z.object({
  id: z.string().uuid(),
  deviceType: z.enum(["PC", "MOBILE", "TABLET", "UNKNOWN"]),
  appName: z.string(),
  status: z.enum(["ACTIVE", "REVOKED"]),
  lastAccess: z.string().datetime(),
  firstAccess: z.string().datetime(),
  ipAddress: z.string(),
  remembered: z.boolean().default(false),
  current: z.boolean().optional()
});

export type UserDevice = z.infer<typeof UserDeviceResponseSchema>;
