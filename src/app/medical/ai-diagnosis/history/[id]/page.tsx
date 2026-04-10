import { ResultView } from "@/features/results/result-view";

interface ResultDetailPageProps {
  params: {
    id: string;
  };
}

export default function ResultDetailPage({ params }: ResultDetailPageProps) {
  return <ResultView resultId={params.id} />;
}
