import * as z from "zod";

export const roleSchema = z.object({
  name: z.string().min(2, "Tên vai trò ít nhất 2 ký tự").transform((v) => v.toUpperCase()),
  description: z.string().optional().or(z.literal("")),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
