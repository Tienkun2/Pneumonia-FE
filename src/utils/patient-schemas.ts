import * as z from "zod";

export const patientSchema = z.object({
  code: z.string().min(1, "Mã bệnh nhân là bắt buộc"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  guardianName: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
