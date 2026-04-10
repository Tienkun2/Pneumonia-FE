import { ResultView } from "@/features/results/result-view";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface ResultDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;
  return (
    <Suspense 
       fallback={
         <div className="flex flex-col items-center justify-center py-24 gap-4">
           <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
           <p className="text-sm font-bold text-muted-foreground opacity-40 uppercase tracking-widest">Tải kết quả...</p>
         </div>
       }
    >
      <ResultView resultId={id} />
    </Suspense>
  );
}
