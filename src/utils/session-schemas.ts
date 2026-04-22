import { z } from "zod";

export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  deviceType: z.enum(["PC", "MOBILE", "TABLET", "UNKNOWN"]),
  appName: z.string(), // e.g., "Chrome", "Edge"
  status: z.enum(["ACTIVE", "EXPIRED", "REVOKED"]),
  loginTime: z.string().datetime(),
  expiryTime: z.string().datetime(),
  ipAddress: z.string(),
  userAgent: z.string().optional(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

export const SessionResponseSchema = z.array(UserSessionSchema);
