import { DiagnosisForm } from "@/features/diagnosis/diagnosis-form";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";

export default function AnalysisPage() {
  return (
    <Suspense fallback={<PageLoader label="Đang tải chẩn đoán..." />}>
      <DiagnosisForm />
    </Suspense>
  );
}
