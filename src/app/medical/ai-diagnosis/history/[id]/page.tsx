import { ResultView } from "@/features/results/result-view";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";

interface ResultDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;
  return (
    <Suspense 
      fallback={<PageLoader label="Tải kết quả..." />}
    >
      <ResultView resultId={id} />
    </Suspense>
  );
}
