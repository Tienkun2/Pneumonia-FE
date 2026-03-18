import * as z from "zod";

// Schema for creating/updating a user's basic info
export const userSchema = z.object({
  username: z.string().min(3, "Username ít nhất 3 ký tự"),
  displayName: z.string().optional(),
  dob: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userSchema>;

// Schema for assigning roles to a user
export const roleSchema = z.object({
  roles: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 role"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
