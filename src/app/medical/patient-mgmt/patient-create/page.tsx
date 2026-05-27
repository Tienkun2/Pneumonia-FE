import { NewRegistration } from "@/features/patients/new-registration";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";

export default function NewRegistrationPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <NewRegistration />
    </Suspense>
  );
}
