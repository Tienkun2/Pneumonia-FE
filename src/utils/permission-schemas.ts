import * as z from "zod";

export const permissionSchema = z.object({
  name: z.string().min(3, "Mã quyền ít nhất 3 ký tự").transform((v) => v.toUpperCase()),
  description: z.string().optional().or(z.literal("")),
});

export type PermissionFormValues = z.infer<typeof permissionSchema>;
