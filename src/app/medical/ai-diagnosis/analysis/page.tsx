import { DiagnosisForm } from "@/features/diagnosis/diagnosis-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function AnalysisPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-sm font-bold text-muted-foreground opacity-40 uppercase tracking-widest">Đang tải chẩn đoán...</p>
        </div>
      }
    >
      <DiagnosisForm />
    </Suspense>
  );
}
