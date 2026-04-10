import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { activateAccount, logout } from "@/store/slices/auth-slice";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

    confirmPassword: z
      .string()
      .min(1, "Vui lòng nhập xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export function useActivateForm(token: string | null) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isLoading } = useAppSelector((state) => state.auth);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token không hợp lệ");
      return;
    }

    const result = await dispatch(
      activateAccount({
        token,
        password: data.password,
      })
    );

    if (activateAccount.fulfilled.match(result)) {
      toast.success("Kích hoạt tài khoản thành công");

      // Xoá session cũ (nếu admin đang test) để đảm bảo về trang login thay vì bị middleware đẩy sang dashboard
      dispatch(logout());

      setTimeout(() => {
        router.push("/auth/login");
      }, 800);
    } else {
      toast.error(
        (result.payload as string) || "Kích hoạt thất bại"
      );
    }
  };

  return { form, onSubmit, isLoading };
}
