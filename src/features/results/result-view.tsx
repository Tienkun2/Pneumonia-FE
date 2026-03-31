"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useReactToPrint } from "react-to-print";
import {
  ArrowLeft,
  ArrowLeftRight,
  Printer,
  ShieldCheck,
  Eye,
  FileCheck,
  Stethoscope,
  Activity as ActivityIcon,
} from "lucide-react";
import Link from "next/link";
import { ImageViewer } from "@/components/medical/image-viewer";
import { toast } from "sonner";

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
  imageUrl: "https://res.cloudinary.com/dkgj2x06c/image/upload/v1743243059/xray_1743243056984.jpg",
};

export function ResultView({ resultId }: { resultId: string }) {
  const predictionResult = useAppSelector((state) => state.diagnosis.predictionResult);
  const imagePreview = useAppSelector((state) => state.diagnosis.imagePreview);
  const patientId = useAppSelector((state) => state.diagnosis.patientId);
  const contentRef = useRef<HTMLDivElement>(null);

  const [showImageViewer, setShowImageViewer] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Pneumonia_Report_${resultId}`,
  });

  const getResult = () => {
    if (predictionResult) {
      const riskScore = predictionResult.probability_pneumonia * 100;
      return {
        id: predictionResult.filename || resultId,
        patientName: "Bệnh nhân hiện tại",
        date: new Date().toLocaleDateString("vi-VN"),
        imageRisk: riskScore,
        clinicalRisk: 75,
        overallRisk: riskScore,
        riskLevel: riskScore > 70 ? "Cao" : riskScore > 40 ? "Trung bình" : "Thấp",
        findings: predictionResult.explanation_vi || predictionResult.message || "Không có giải thích cụ thể.",
        imageUrl: imagePreview || "https://via.placeholder.com/800x800?text=X-Ray+Image",
      };
    }
    return mockResult;
  };

  const result = getResult();

  const handleExport = () => {
    toast.info("Đang mở trình quản lý in...");
    handlePrint();
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="flex items-center gap-3">
          <Link href="/diagnosis">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 border border-slate-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kết quả chẩn đoán</h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide">PHIẾU KẾT QUẢ AI #{result.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg px-6 h-10 gap-2"
          >
            <Printer className="h-4 w-4" />
            In phiếu kết quả
          </Button>
        </div>
      </div>

      <div ref={contentRef} id="medical-report-content" className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Medical Header Overlay */}
        <div className="flex justify-between items-start mb-10 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <ShieldCheck className="h-7 w-7" />
              <span className="text-xl font-black tracking-tighter uppercase italic">Antigravity AI</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Medical Imaging System v2.0</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 uppercase">Bệnh nhi: {result.patientName}</p>
            <p className="text-xs text-slate-500 font-medium">Ngày chẩn đoán: {result.date}</p>
            <p className="text-xs text-slate-500 font-medium">Mã kết quả: #{result.id}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Visual Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 aspect-square">
              <img src={result.imageUrl} alt="X-Ray" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl font-bold gap-2"
                  onClick={() => setShowImageViewer(true)}
                >
                  <Eye className="h-4 w-4" /> Trình xem chuyên dụng
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <FileCheck className="h-3 w-3" />
                  <span className="text-[10px] uppercase font-black">Hình ảnh</span>
                </div>
                <p className="text-xl font-black text-slate-900">{result.imageRisk.toFixed(1)}%</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <ActivityIcon className="h-3 w-3" />
                  <span className="text-[10px] uppercase font-black">Lâm sàng</span>
                </div>
                <p className="text-xl font-black text-slate-900">{result.clinicalRisk}%</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="lg:col-span-7 space-y-8 lg:pl-4">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Phân tích & Kết luận
              </h3>
              <div className="p-5 rounded-2xl bg-slate-50 text-slate-700 text-sm leading-relaxed border border-slate-100">
                {result.findings}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> Khuyến nghị y khoa
              </h3>
              <div className="grid gap-3">
                {mockResult.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-white shadow-sm italic text-xs text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">{i + 1}</div>
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Badge */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">NGUY CƠ:</span>
                <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${result.riskLevel === "Cao" ? "bg-red-500 text-white" :
                    result.riskLevel === "Trung bình" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                  }`}>
                  {result.riskLevel}
                </div>
              </div>
              <div className="text-[10px] text-slate-300 font-mono italic">
                Verified by Antigravity DeepLearning Core
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4 justify-center">
        <Button asChild variant="outline" className="rounded-xl px-10 h-12 border-slate-200 font-bold hover:bg-slate-50">
          <Link href="/diagnosis">Chẩn đoán mới</Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl px-10 h-12 border-slate-200 font-bold hover:bg-slate-50">
          <Link href="/comparison" className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            So sánh tiến triển
          </Link>
        </Button>
        {patientId && (
          <Button variant="ghost" size="lg" asChild className="rounded-2xl px-8 text-slate-500 hover:bg-slate-50 font-bold">
            <Link href={`/patients/${patientId}`}>Xem hồ sơ bệnh nhân</Link>
          </Button>
        )}
      </div>

      <ImageViewer
        src={result.imageUrl}
        open={showImageViewer}
        onOpenChange={setShowImageViewer}
      />
    </div>
  );
}
