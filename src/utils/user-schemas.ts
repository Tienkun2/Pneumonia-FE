import * as z from "zod";

// Schema for creating/updating a user's basic info
export const userSchema = z.object({
  username: z.string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  displayName: z.string()
    .optional()
    .or(z.literal("")),
  dob: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age >= 18;
  }, {
    message: "Nhân viên phải từ 18 tuổi trở lên"
  }).optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  email: z.string()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Định dạng email không hợp lệ"),
});

export type UserFormValues = z.infer<typeof userSchema>;

// Schema for assigning roles to a user
export const roleSchema = z.object({
  roles: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 role"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
