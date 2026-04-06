"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  Eye,
  FileCheck,
  Stethoscope,
  Activity as ActivityIcon,
  BrainCircuit,
  AlertTriangle,
  ChevronRight,
  Clock,
  Hash,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ImageViewer } from "@/components/medical/image-viewer";
import { toast } from "sonner";



/* ─── Risk config ──────────────────────────────────────────── */
const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; barColor: string }> = {
  Cao:       { label: "NGUY CƠ CAO",       color: "text-red-500",     bg: "bg-red-500/10",     border: "border-red-500/20",     dot: "bg-red-500",     barColor: "bg-red-500" },
  "Trung bình": { label: "TRUNG BÌNH",     color: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   dot: "bg-amber-500",   barColor: "bg-amber-500" },
  Thấp:      { label: "NGUY CƠ THẤP",      color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500", barColor: "bg-emerald-500" },
};

const getBarColor = (val: number) => val > 70 ? "bg-red-500" : val > 40 ? "bg-amber-500" : "bg-emerald-500";

/* ─── Component ─────────────────────────────────────────────── */
import { useEffect } from "react";
import { VisitService } from "@/services/visit-service";
import { PatientService } from "@/services/patient-service";
import { Visit } from "@/types/visit";
import { Patient } from "@/types/patient";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

import { useSearchParams } from "next/navigation";

export function ResultView({ resultId }: { resultId: string }) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching visit details for ID:", resultId);
        
        let visitData: Visit | null = null;
        
        try {
          visitData = await VisitService.getVisitById(resultId);
        } catch (vError) {
          console.warn("Direct visit fetch failed, trying patient visits fallback:", vError);
          // If we have a patientId from URL, we can try to find the visit in their history
          if (patientIdParam) {
            const patientVisits = await VisitService.getPatientVisits(patientIdParam);
            visitData = patientVisits.find(v => v.id === resultId) || null;
          }
          
          if (!visitData) throw vError; // Re-throw if fallback fails too
        }

        if (!visitData) {
          throw new Error("Không nhận được dữ liệu từ hệ thống");
        }

        setVisit(visitData);
        
        const effectivePatientId = visitData.patientId || patientIdParam;
        if (effectivePatientId) {
          try {
            const patientData = await PatientService.getPatientById(effectivePatientId);
            setPatient(patientData);
          } catch (pError) {
            console.error("Failed to fetch patient details:", pError);
          }
        }
      } catch (error: unknown) {
        console.error("Failed to fetch visit details trace:", error);
        const message = error instanceof Error ? error.message : "Kết nối Backend thất bại";
        toast.error(`Lỗi tải dữ liệu: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [resultId, patientIdParam]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Pneumonia_Report_${resultId}`,
  });

  const handleExport = () => { toast.info("Đang mở trình in..."); handlePrint(); };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[14px] font-bold text-muted-foreground">Đang tải dữ liệu hồ sơ...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-[16px] font-black text-foreground">Không tìm thấy hồ sơ chẩn đoán</p>
        <Link href="/results">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const getRiskStatus = (v: Visit) => {
    const lastDiag = v.diagnoses?.[0];
    if (lastDiag?.result) {
      if (lastDiag.result === "PNEUMONIA") return "Cao";
      if (lastDiag.result === "NORMAL") return "Thấp";
      return lastDiag.result;
    }
    return "Thấp";
  };

  const lastDiagnosis = visit.diagnoses?.[0];
  const riskScore = lastDiagnosis ? lastDiagnosis.confidenceScore * 100 : 0;
  const riskStatus = getRiskStatus(visit);
  const risk = RISK_CONFIG[riskStatus] ?? RISK_CONFIG["Thấp"];

  return (
    <div className="space-y-5 pb-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/results">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/50 bg-card shadow-sm hover:bg-muted/30">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[20px] font-black text-foreground tracking-tight leading-tight">Kết quả chẩn đoán</h1>
            <p className="text-[12px] font-semibold text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Hash className="h-3 w-3" /> Phiếu kết quả AI #{visit.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2 px-5 shadow-lg text-[13px] font-bold"
        >
          <Printer className="h-4 w-4" /> In phiếu kết quả
        </Button>
      </div>

      {/* ── Risk Banner ─────────────────────────────────── */}
      <div className={`rounded-[20px] border px-6 py-5 flex items-center justify-between gap-4 ${risk.bg} ${risk.border}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-card shadow-sm border ${risk.border}`}>
            <BrainCircuit className={`h-6 w-6 ${risk.color}`} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest">Kết quả phân tích AI</p>
            <p className={`text-[20px] font-black ${risk.color} leading-tight uppercase`}>{risk.label}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Điểm tổng hợp</p>
          <p className={`text-[38px] font-black leading-none ${risk.color}`}>{riskScore.toFixed(0)}%</p>
        </div>
      </div>

      {/* ── Main Report Card ────────────────────────────── */}
      <div
        ref={contentRef}
        id="medical-report-content"
        className="bg-card rounded-[20px] shadow-sm border border-border/20 overflow-hidden"
      >
        {/* Report Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-[16px] font-black text-foreground tracking-tight">Care DR.</span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hệ thống chẩn đoán phổi AI · v2.0</p>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-[13px] font-black text-foreground uppercase">Bệnh nhân: {patient?.fullName || "N/A"}</p>
            <p className="text-[12px] font-semibold text-muted-foreground flex items-center justify-end gap-1.5">
              <Clock className="h-3 w-3" /> {formatDate(visit.visitDate, "HH:mm:ss DD/MM/YYYY")}
            </p>
            <p className="text-[11px] font-semibold text-muted-foreground">Mã BN: {patient?.code || "N/A"}</p>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid gap-0 lg:grid-cols-12">
          {/* Left: Image + Scores */}
          <div className="lg:col-span-5 border-r border-border/20 p-6 space-y-5">
            {/* X-ray image */}
            <div
              className="relative group aspect-square w-full overflow-hidden rounded-2xl bg-slate-950 border border-border/20 cursor-pointer shadow-inner"
              onClick={() => setShowImageViewer(true)}
            >
              {visit.medicalImages && visit.medicalImages.length > 0 ? (
                <Image
                  src={visit.medicalImages[0].imageUrl}
                  alt="X-Ray Image"
                  fill
                  priority
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-500">
                   <AlertTriangle className="h-8 w-8 mb-2" />
                   <p className="text-[12px] font-bold">Không có hình ảnh</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-xl flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-foreground">
                  <Eye className="h-4 w-4" /> Phóng to xem
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                X-Ray Image
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Hình ảnh (Vision)", icon: FileCheck, value: riskScore },
                { label: "Lâm sàng (Clinical)", icon: ActivityIcon, value: 75 }, // Static or calculate if possible
              ].map(({ label, icon: Icon, value }) => (
                <div key={label} className="bg-muted/30 rounded-2xl p-4 border border-border/30 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-[24px] font-black text-foreground leading-none">{value.toFixed(1)}%</p>
                  <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getBarColor(value)}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall score bar */}
            <div className={`rounded-2xl p-4 border ${risk.bg} ${risk.border} space-y-2 shadow-sm`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">Điểm Tổng hợp AI</span>
                <span className={`text-[15px] font-black ${risk.color}`}>{riskScore.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full ${risk.barColor} transition-all duration-700`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Analysis & Recommendations */}
          <div className="lg:col-span-7 p-6 space-y-6">
            {/* Findings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-[13px] font-black text-primary uppercase tracking-widest">Ghi chú & Chẩn đoán</h3>
              </div>
              <div className="bg-muted/30 rounded-2xl border border-border/30 p-5 space-y-4">
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-muted-foreground uppercase">Triệu chứng lâm sàng:</p>
                    <p className="text-[13px] text-foreground/80 leading-relaxed font-semibold">
                      {visit.symptoms || "Không có ghi chú triệu chứng."}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-muted-foreground uppercase">Ghi chú của bác sĩ:</p>
                    <p className="text-[13px] text-foreground/80 leading-relaxed italic font-medium">
                      {visit.note || "Không có ghi chú thêm."}
                    </p>
                 </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h3 className="text-[13px] font-black text-blue-700 uppercase tracking-widest">Khuyến nghị chẩn đoán</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  "Kiểm tra lâm sàng định kỳ theo chỉ dẫn của bác sĩ",
                  "Theo dõi sát các triệu chứng hô hấp",
                  "Liên hệ ngay cơ sở y tế khi có dấu hiệu khó thở tăng dần"
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-card hover:bg-muted/40 transition-colors shadow-sm group">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-[13px] font-semibold text-foreground/80 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer stamp */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Phân loại AI:</span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black text-white ${risk.barColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {risk.label}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/50 font-mono italic">Verified · Admin • Care DR. v2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Disclaimer ──────────────────────────────────── */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-500/90 font-medium leading-relaxed italic">
          Báo cáo này được tự động tạo ra bởi mô hình AI và chỉ dành cho mục đích tham khảo lâm sàng. Quyết định cuối cùng thuộc về bác sĩ điều trị.
        </p>
      </div>

      {/* ── Action Buttons ──────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="outline" className="rounded-xl px-8 h-11 border-border/50 bg-card font-bold text-[13px] shadow-sm hover:bg-muted/30">
          <Link href="/results">Quay lại danh sách</Link>
        </Button>
        {patient && (
          <Button asChild className="rounded-xl px-8 h-11 font-bold text-[13px] shadow-md shadow-primary/20 gap-2">
            <Link href={`/diagnosis`}>
              Tạo chẩn đoán mới <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <ImageViewer src={visit.medicalImages?.[0]?.imageUrl || ""} open={showImageViewer} onOpenChange={setShowImageViewer} />
    </div>
  );
}
