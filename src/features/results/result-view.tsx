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
  Loader2,
  Calendar,
  User,
  ShieldAlert,
  BrainCircuit,
  Zap,
  FileText,
  Check,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ImageViewer } from "@/components/medical/image-viewer";
import { toast } from "sonner";
import { VisitService } from "@/services/visit-service";
import { PatientService } from "@/services/patient-service";
import { Visit } from "@/types/diagnosis";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Risk Config ─────────────────────────────────────────────────────────────
const RISK_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    ring: string;
  }
> = {
  Cao: {
    label: "Nguy cơ cao",
    color: "text-red-500",
    bg: "bg-red-500/8 dark:bg-red-500/5",
    border: "border-red-500/20",
    dot: "bg-red-500",
    ring: "#ef4444",
  },
  "Trung bình": {
    label: "Nguy cơ trung bình",
    color: "text-amber-500",
    bg: "bg-amber-500/8 dark:bg-amber-500/5",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    ring: "#f59e0b",
  },
  Thấp: {
    label: "Nguy cơ thấp",
    color: "text-emerald-500",
    bg: "bg-emerald-500/8 dark:bg-emerald-500/5",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    ring: "#10b981",
  },
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, riskKey }: { score: number; riskKey: string }) {
  const [displayed, setDisplayed] = useState(0);
  const risk = RISK_CONFIG[riskKey] ?? RISK_CONFIG["Thấp"];
  const pct = Math.round(score);

  useEffect(() => {
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      setDisplayed(Math.round((frame / total) * pct));
      if (frame >= total) clearInterval(timer);
    }, 1000 / total);
    return () => clearInterval(timer);
  }, [pct]);

  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = (displayed / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70" cy="70" r={radius}
            fill="none" stroke="currentColor" strokeWidth="10"
            className="text-muted/25"
          />
          <circle
            cx="70" cy="70" r={radius}
            fill="none" stroke={risk.ring} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{
              transition: "stroke-dasharray 0.05s linear",
              filter: `drop-shadow(0 0 8px ${risk.ring}60)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-black tabular-nums leading-none", risk.color)}>
            {displayed}%
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            xác suất
          </span>
        </div>
      </div>
      <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wide", risk.border, risk.bg, risk.color)}>
        <span className={cn("w-2 h-2 rounded-full animate-pulse", risk.dot)} />
        {risk.label}
      </div>
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card/60", className)}>
      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Recommendation Item ──────────────────────────────────────────────────────
function RecommendItem({ icon: Icon, text, color, bg }: { icon: React.ElementType; text: string; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 hover:border-border/60 transition-all group">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="text-sm font-semibold text-foreground">{text}</p>
      <Check className="h-3.5 w-3.5 text-muted-foreground/30 ml-auto" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
            const list = await VisitService.getPatientVisits(patientIdParam);
            visitData = list.find((v) => v.id === resultId) || null;
          } catch (e) {
            console.warn("Fallback to direct visit fetch", e);
          }
        }
        if (!visitData) visitData = await VisitService.getVisitById(resultId);
        setVisit(visitData);
        const pid = visitData?.patientId || patientIdParam;
        if (pid) setPatient(await PatientService.getPatientById(pid));
      } catch (err: unknown) {
        toast.error(`Lỗi tải dữ liệu: ${err instanceof Error ? err.message : "Đã có lỗi xảy ra"}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [resultId, patientIdParam]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `PlumoX_Report_${patient?.fullName || resultId}`,
  });

  const { totalWeightedScore } = useMemo(() => {
    const backendScore = visit?.confidenceScore ? visit.confidenceScore * 100 : null;
    const vision = visit?.diagnoses?.[0]?.confidenceScore ? visit.diagnoses[0].confidenceScore * 100 : 0;
    const symptomsList = visit?.symptoms?.split(",").filter(Boolean) || [];
    const clinicalBase = symptomsList.length > 3 ? 85 : symptomsList.length > 0 ? 60 : 30;
    return { totalWeightedScore: backendScore ?? vision * 0.7 + clinicalBase * 0.3 };
  }, [visit]);

  const riskStatus = useMemo(() => {
    if (visit?.diagnosisResult === "NORMAL") return "Thấp";
    if (visit?.diagnosisResult) return totalWeightedScore > 70 ? "Cao" : "Trung bình";
    return totalWeightedScore > 70 ? "Cao" : totalWeightedScore > 40 ? "Trung bình" : "Thấp";
  }, [visit, totalWeightedScore]);

  const risk = RISK_CONFIG[riskStatus];

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="relative w-14 h-14">
          <Loader2 className="h-14 w-14 animate-spin text-primary/20" />
          <BrainCircuit className="h-6 w-6 text-primary absolute inset-0 m-auto" />
        </div>
        <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest animate-pulse">
          Đang tải kết quả chẩn đoán...
        </p>
      </div>
    );
  }

  if (!visit) return null;

  const symptoms = visit.symptoms?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const imageUrl = visit.medicalImages?.[0]?.imageUrl || "";
  const visitDate = new Date(visit.visitDate);

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-20 animate-in fade-in duration-500">

      {/* ── HEADER BAR ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/medical/ai-diagnosis/history">
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-muted border border-border/50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground leading-none">Kết quả chẩn đoán</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Chi tiết lượt khám #{resultId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <Button
          onClick={() => handlePrint()}
          variant="outline"
          className="gap-2 text-xs font-bold h-9 px-4 rounded-xl border-border/60 hover:bg-muted"
        >
          <Printer className="h-3.5 w-3.5" /> In kết quả
        </Button>
      </div>

      {/* ── PRINTABLE CONTENT ───────────────────────────────────── */}
      <div ref={contentRef} className="space-y-4">

        {/* ── TOP INFO STRIP ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill icon={User} label="Bệnh nhân" value={patient?.fullName || "—"} className="col-span-2 sm:col-span-1" />
          <StatPill icon={FileText} label="Mã BN" value={patient?.code || "—"} />
          <StatPill icon={Calendar} label="Ngày khám" value={visitDate.toLocaleDateString("vi-VN")} />
          <StatPill icon={ShieldAlert} label="Kết quả AI" value={visit.diagnosisResult || visit.diagnoses?.[0]?.result || "—"} />
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT: Image Panel */}
          <div className="lg:col-span-5 space-y-3">
            <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60">
              <CardHeader className="px-4 py-3 border-b border-border/40 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Phim X-quang / Grad-CAM
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div
                  className="relative aspect-square bg-slate-950 rounded-xl overflow-hidden border border-border/20 cursor-zoom-in group"
                  onClick={() => setShowImageViewer(true)}
                >
                  {imageUrl ? (
                    <Image src={imageUrl} alt="X-ray" fill className="object-contain" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/20">
                      <BrainCircuit className="h-16 w-16" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-xs font-bold">
                      Nhấn để phóng to
                    </div>
                  </div>
                  {/* Result label */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-xs text-white/80 font-bold italic text-center">
                      &quot;{visit.diagnosisResult || visit.diagnoses?.[0]?.result || "—"}&quot;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Note if exists */}
            {visit.note && (
              <Card className="border-border/60 shadow-sm bg-card/60">
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Ghi chú bác sĩ
                  </p>
                  <p className="text-sm text-foreground/80 italic leading-relaxed">&quot;{visit.note}&quot;</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT: Score + Details */}
          <div className="lg:col-span-7 flex flex-col gap-4">

            {/* Score Ring Card */}
            <Card className={cn("border overflow-hidden shadow-md", risk.border)}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreRing score={totalWeightedScore} riskKey={riskStatus} />
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-foreground">Thông tin lâm sàng</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Mô hình AI", value: visit.diagnoses?.[0]?.modelVersion || "EfficientNet-B4" },
                        { label: "Thời gian", value: `${visitDate.toLocaleDateString("vi-VN")} lúc ${visitDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` },
                        { label: "Số triệu chứng", value: `${symptoms.length} dấu hiệu được ghi nhận` },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start justify-between gap-2 py-2 border-b border-border/30 last:border-0">
                          <span className="text-xs font-semibold text-muted-foreground shrink-0">{item.label}</span>
                          <span className="text-xs font-bold text-foreground text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms */}
            <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60">
              <CardHeader className="px-4 py-3 border-b border-border/40 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-500" /> Triệu chứng lâm sàng
                  {symptoms.length > 0 && (
                    <Badge className="ml-auto bg-teal-500/10 text-teal-600 dark:text-teal-400 border-none text-[10px] font-bold">
                      {symptoms.length} dấu hiệu
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {symptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((s, idx) => (
                      <Badge
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-500/8 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                      >
                        <Check className="h-3 w-3 mr-1.5" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic text-center py-4">Không ghi nhận triệu chứng</p>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60">
              <CardHeader className="px-4 py-3 border-b border-border/40 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Khuyến nghị y tế
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <RecommendItem icon={UserCheck} text="Thăm khám bác sĩ chuyên khoa hô hấp" color="text-blue-500" bg="bg-blue-500/10" />
                <RecommendItem icon={Pill} text="Sử dụng đơn thuốc theo chỉ định của bác sĩ" color="text-amber-500" bg="bg-amber-500/10" />
                <RecommendItem icon={Activity} text="Theo dõi nhịp thở và SpO₂ tại nhà" color="text-emerald-500" bg="bg-emerald-500/10" />
                <RecommendItem icon={Hospital} text="Nhập viện ngay nếu có dấu hiệu cấp tính" color="text-red-500" bg="bg-red-500/10" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Button
          asChild
          variant="outline"
          className="rounded-xl px-8 h-11 font-bold text-sm border-border/60 hover:bg-muted text-muted-foreground"
        >
          <Link href="/medical/ai-diagnosis/history">
            <ArrowLeft className="h-4 w-4 mr-2" /> Trở lại
          </Link>
        </Button>
        <Button
          asChild
          className="rounded-xl px-10 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 font-bold text-sm gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href={`/medical/ai-diagnosis/analysis?patientId=${visit.patientId}`}>
            <PlusCircle className="h-4 w-4" /> Chẩn đoán mới
          </Link>
        </Button>
      </div>

      <ImageViewer src={imageUrl} open={showImageViewer} onOpenChange={setShowImageViewer} />
    </div>
  );
}
