import ActivateForm from "@/features/auth/active-form";
import { Suspense } from "react";

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Đang tải...</div>}>
      <ActivateForm />
    </Suspense>
  );
}
