"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/medical/risk-gauge"
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { ArrowLeft, Download, ZoomIn } from "lucide-react";
import Link from "next/link";
import { ImageViewer } from "@/components/medical/image-viewer";

// Mock data
const mockResult = {
  id: "123",
  patientName: "Nguyễn Văn A",
  date: "2024-01-20 14:30",
  imageRisk: 85,
  clinicalRisk: 78,
  overallRisk: 82,
  riskLevel: "Cao",
  findings: `Dựa trên phân tích hình ảnh X-quang và dữ liệu lâm sàng, hệ thống phát hiện:

1. Hình ảnh X-quang: Có dấu hiệu thâm nhiễm ở thùy dưới phổi phải, mật độ không đồng nhất, gợi ý viêm phổi.

2. Dữ liệu lâm sàng:
   - Bệnh nhân có sốt, ho, khó thở
   - WBC tăng cao (12.5 x10³/µL)
   - CRP tăng (45 mg/L)
   - SpO2 giảm (92%)

3. Kết luận: Nguy cơ viêm phổi cao (82%). Khuyến nghị:
   - Điều trị kháng sinh phù hợp
   - Theo dõi sát tình trạng hô hấp
   - Xét nghiệm thêm nếu cần`,
  recommendations: [
    "Điều trị kháng sinh theo phác đồ viêm phổi cộng đồng",
    "Theo dõi SpO2 và tình trạng hô hấp",
    "Chụp X-quang lại sau 48-72 giờ để đánh giá đáp ứng",
    "Xét nghiệm máu để theo dõi tình trạng viêm",
  ],
  imageUrl: "https://via.placeholder.com/800x800?text=X-Ray+Image",
};

export function ResultView({ resultId }: { resultId: string }) {
  const predictionResult = useAppSelector((state) => state.diagnosis.predictionResult);
  const imagePreview = useAppSelector((state) => state.diagnosis.imagePreview);

  // Transform AI result to view format or use mock if no result found
  // In a real app, we might fetch from backend using resultId if it's not in store
  const getResult = () => {
    if (predictionResult && predictionResult.filename === resultId) {
      // Map AI result to view model
      const isPneumonia = predictionResult.prediction === "PNEUMONIA";
      const riskScore = predictionResult.probability_pneumonia * 100;

      return {
        id: predictionResult.filename,
        patientName: "Bệnh nhân hiện tại", // Should get from store too if needed
        date: new Date().toLocaleString(),
        imageRisk: riskScore,
        clinicalRisk: 0,
        overallRisk: riskScore,
        riskLevel: riskScore > 70 ? "Cao" : riskScore > 40 ? "Trung bình" : "Thấp",
        findings: `**KẾT QUẢ AI PHÂN TÍCH**\n\nChẩn đoán: ${predictionResult.prediction}\nĐộ chính xác: ${(predictionResult.confidence_score * 100).toFixed(2)}%\n\nThông điệp: ${predictionResult.message}`,

        imageUrl: imagePreview || "https://via.placeholder.com/800x800?text=X-Ray+Image",
      };
    }
    return mockResult;
  };

  const result = getResult();
  const [showImageViewer, setShowImageViewer] = useState(false);

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "text-destructive";
    if (risk >= 40) return "text-orange-500";
    return "text-green-500";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return "Cao";
    if (risk >= 40) return "Trung bình";
    return "Thấp";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/diagnosis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Kết quả chẩn đoán</h1>
          <p className="text-muted-foreground">
            Phân tích và giải thích từ AI
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <RiskGauge
          riskScore={result.imageRisk}
          riskLevel={getRiskLabel(result.imageRisk) as "Cao" | "Trung bình" | "Thấp"}
          label="Nguy cơ từ hình ảnh (AI)"
        />
        {/* Only show other gauges if we have clinical data (skipped for now) */}
        {/* <RiskGauge riskScore={...} /> */}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Phát hiện và giải thích</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Tải báo cáo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {result.findings}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>



      <div className="flex gap-4">
        <Button asChild>
          <Link href="/diagnosis">Chẩn đoán mới</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/patients/${result.id}`}>Xem hồ sơ bệnh nhân</Link>
        </Button>
      </div>

      <ImageViewer
        src={result.imageUrl}
        open={showImageViewer}
        onOpenChange={setShowImageViewer}
      />
    </div>
  );
}
