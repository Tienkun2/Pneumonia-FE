"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef, useMemo, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import {
  ArrowLeft,
  Printer,
  Stethoscope,
  Pill,
  Hospital,
  UserCheck,
  Activity,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ImageViewer } from "@/components/medical/image-viewer";
import { toast } from "sonner";
import { VisitService } from "@/services/visit-service";
import { PatientService } from "@/services/patient-service";
import { Visit } from "@/types/diagnosis";
import { Patient } from "@/types/patient";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Cao:       { label: "Nguy cơ cao",       color: "text-red-500",     bg: "bg-red-500/10" },
  "Trung bình": { label: "Trung bình",     color: "text-amber-500",   bg: "bg-amber-500/10" },
  Thấp:      { label: "Nguy cơ thấp",      color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

export function ResultView({ resultId }: { resultId: string }) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");

  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetchedIdRef.current === resultId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        fetchedIdRef.current = resultId;
        let visitData: Visit | null = null;
        if (patientIdParam) { 
          try { 
            const patientVisits = await VisitService.getPatientVisits(patientIdParam);
            visitData = patientVisits.find(v => v.id === resultId) || null;
          } catch (e) {
            console.warn("Lỗi khi lấy via PatientVisits, thử gọi trực tiếp...", e);
          }
        }

        // Nếu không có patientId hoặc lấy theo list thất bại, mới gọi trực tiếp theo ID
        if (!visitData) {
          visitData = await VisitService.getVisitById(resultId);
        }

        setVisit(visitData);
        const effectivePatientId = visitData?.patientId || patientIdParam;
        if (effectivePatientId) {
          const patientData = await PatientService.getPatientById(effectivePatientId);
          setPatient(patientData);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
        toast.error(`Lỗi tải dữ liệu: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [resultId, patientIdParam]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Medical_Report_${patient?.fullName || ""}`,
  });

  const { totalWeightedScore } = useMemo(() => {
    const backendScore = visit?.confidenceScore ? visit.confidenceScore * 100 : null;
    
    const vision = visit?.diagnoses?.[0]?.confidenceScore ? visit.diagnoses[0].confidenceScore * 100 : 0;
    const symptomsList = visit?.symptoms?.split(",").filter(Boolean) || [];
    const clinicalBase = symptomsList.length > 3 ? 85 : symptomsList.length > 0 ? 60 : 30;
    
    return {
      totalWeightedScore: backendScore ?? (vision * 0.7) + (clinicalBase * 0.3)
    };
  }, [visit]);

  const riskStatus = useMemo(() => {
    if (visit?.diagnosisResult) {
       if (visit.diagnosisResult === "NORMAL") return "Thấp";
       return totalWeightedScore > 70 ? "Cao" : "Trung bình";
    }
    return totalWeightedScore > 70 ? "Cao" : totalWeightedScore > 40 ? "Trung bình" : "Thấp";
  }, [visit, totalWeightedScore]);

  const risk = RISK_CONFIG[riskStatus];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Đang tải kết quả...</p>
      </div>
    );
  }

  if (!visit) return null;

  const symptoms = visit.symptoms?.split(",").map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/medical/ai-diagnosis/history">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted border border-border/50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Kết quả chẩn đoán</h1>
        </div>
        <Button onClick={() => handlePrint()} variant="outline" className="gap-2 font-bold px-6">
          <Printer className="h-4 w-4" /> In kết quả
        </Button>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div ref={contentRef} className="space-y-6">
        
        {/* Info Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient & Time Info Combined */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground truncate">{patient?.fullName || "—"}</h3>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span>{patient?.code || "—"}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{patient?.gender}</span>
              </div>
            </div>
            <div className="text-right border-l border-border/50 pl-6 space-y-1">
              <div className="text-sm font-bold text-foreground">
                {new Date(visit.visitDate).toLocaleDateString("vi-VN")}
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                {new Date(visit.visitDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className={cn("p-6 rounded-2xl border flex items-center justify-between gap-4 shadow-sm", risk.bg, "border-border/20")}>
            <div className="space-y-1">
              <div className={cn("text-2xl font-black uppercase tracking-tight leading-none", risk.color)}>{risk.label}</div>
              <div className="text-sm font-bold text-muted-foreground opacity-70">Xác suất: {totalWeightedScore.toFixed(0)}%</div>
            </div>
            <Activity className={cn("h-8 w-8 opacity-20", risk.color)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Image Section */}
          <div className="md:col-span-5 space-y-4">
            <div 
              className="relative aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-border/20 cursor-zoom-in group"
              onClick={() => setShowImageViewer(true)}
            >
              <Image 
                src={visit.medicalImages?.[0]?.imageUrl || ""} 
                alt="X-ray" 
                fill 
                className="object-contain" 
                unoptimized 
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-black/60 backdrop-blur-sm">
                 <p className="text-[13px] text-white font-medium italic text-center">
                    &quot;{visit.diagnosisResult || visit.diagnoses?.[0]?.result || "Dấu hiệu viêm phổi tiến triển"}&quot;
                 </p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" /> Triệu chứng
               </h4>
               <div className="flex flex-wrap gap-2 pt-1">
                 {symptoms.length > 0 ? symptoms.map((s, idx) => (
                   <Badge key={idx} className="bg-muted text-foreground border-none px-4 py-2 rounded-xl font-bold text-[13px]">
                      {s}
                   </Badge>
                 )) : (
                   <p className="text-sm text-muted-foreground italic">Không ghi nhận triệu chứng.</p>
                 )}
               </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
               <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Khuyến nghị y tế
               </h4>
               <div className="grid grid-cols-1 gap-3">
                  {[
                    { text: "Thăm khám bác sĩ chuyên khoa", icon: UserCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { text: "Sử dụng đơn thuốc kháng sinh", icon: Pill, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { text: "Theo dõi nhịp thở tại nhà", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { text: "Nhập viện nếu có dấu hiệu cấp tính", icon: Hospital, color: "text-red-500", bg: "bg-red-500/10" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/10 group transition-all">
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bg, item.color)}>
                          <item.icon className="h-5 w-5" />
                       </div>
                       <p className="text-sm font-bold text-foreground leading-tight">{item.text}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 pt-8">
        <Button asChild variant="ghost" className="rounded-xl px-10 text-muted-foreground font-bold hover:bg-muted border border-border/50 h-12">
           <Link href="/medical/ai-diagnosis/history">Trở lại</Link>
        </Button>
        <Button asChild className="rounded-xl px-14 h-12 bg-primary hover:primary/90 text-primary-foreground shadow-xl shadow-primary/20 font-black transition-all hover:scale-[1.02] active:scale-[0.98]">
           <Link href={`/medical/ai-diagnosis/analysis?patientId=${visit.patientId}`}>Chẩn đoán mới</Link>
        </Button>
      </div>

      <ImageViewer src={visit.medicalImages?.[0]?.imageUrl || ""} open={showImageViewer} onOpenChange={setShowImageViewer} />
    </div>
  );
}
