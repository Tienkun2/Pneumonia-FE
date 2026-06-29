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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { VisitService } from "@/services/visit-service";
import { PatientService } from "@/services/patient-service";
import { SettingService } from "@/services/setting-service";
import { Visit } from "@/types/diagnosis";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_CONFIG } from "@/constants/results";
import { ScoreRing } from "./components/score-ring";
import { StatPill } from "./components/stat-pill";
import { RecommendItem } from "./components/recommendation-item";
import { PrintReport } from "./components/print-report";
import { Slider } from "@/components/ui/slider";

function renderInlineBold(text: string) {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-extrabold text-foreground">{part}</strong>;
    }
    return part;
  });
}

function renderDoctorNote(noteText: string) {
  if (!noteText) return null;
  const lines = noteText.split("\n");
  const hasMarkdown = lines.some(line => {
    const t = line.trim();
    return t.startsWith("## ") || t.startsWith("### ") || t.startsWith("- ") || t.startsWith("* ");
  });
  
  if (!hasMarkdown) {
    return <p className="text-sm text-foreground/80 italic leading-relaxed whitespace-pre-line">&quot;{noteText}&quot;</p>;
  }
  
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none text-[11px] space-y-1.5 text-foreground leading-relaxed mt-2">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("## ") || trimmedLine.startsWith("### ")) {
          const text = trimmedLine.replace(/^#{2,3}\s+/, "");
          return <h4 key={idx} className="font-bold text-xs text-foreground mt-3 mb-1 border-b border-border/40 pb-1">{text}</h4>;
        }
        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          const text = trimmedLine.replace(/^[-*]\s+/, "");
          return (
            <ul key={idx} className="list-disc pl-4 my-1">
              <li>{renderInlineBold(text)}</li>
            </ul>
          );
        }
        return <p key={idx} className="my-0.5">{renderInlineBold(trimmedLine)}</p>;
      })}
    </div>
  );
}

export function ResultView({ resultId }: { resultId: string }) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [hospitalName, setHospitalName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const printRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetchedIdRef.current === resultId) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        fetchedIdRef.current = resultId;

        // Fetch hospital settings
        try {
          const settings = await SettingService.getSystemSettings();
          if (settings && settings.hospitalName) {
            setHospitalName(settings.hospitalName);
          }
        } catch (se) {
          console.warn("Failed to fetch system settings", se);
        }

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
    contentRef: printRef,
    documentTitle: `PlumoX_Report_${patient?.fullName || resultId}`,
  });

  const { totalWeightedScore } = useMemo(() => {
    const savedScore = visit?.confidenceScore ?? visit?.diagnoses?.[0]?.confidenceScore;
    if (savedScore !== undefined && savedScore !== null) {
      return { totalWeightedScore: savedScore * 100 };
    }
    const symptomsList = visit?.symptoms?.split(",").filter(Boolean) || [];
    const clinicalBase = symptomsList.length > 3 ? 85 : symptomsList.length > 0 ? 60 : 30;
    return { totalWeightedScore: clinicalBase };
  }, [visit]);

  const riskStatus = useMemo(() => {
    if (visit?.diagnosisResult === "NORMAL") return "Thấp";
    if (visit?.diagnosisResult) return totalWeightedScore > 70 ? "Cao" : "Trung bình";
    return totalWeightedScore > 70 ? "Cao" : totalWeightedScore > 40 ? "Trung bình" : "Thấp";
  }, [visit, totalWeightedScore]);

  const dynamicRecommendations = useMemo(() => {
    const HospitalIcon = Hospital;
    const PillIcon = Pill;
    const ActivityIcon = Activity;
    const UserCheckIcon = UserCheck;
    const FileTextIcon = FileText;

    if (riskStatus === "Cao") {
      return [
        { icon: HospitalIcon, text: "Nhập viện điều trị nội trú / ICU khẩn cấp do chỉ số viêm phổi ở mức nguy cơ cao", color: "text-red-500", bg: "bg-red-500/10" },
        { icon: PillIcon, text: "Bắt đầu điều trị kháng sinh đường tiêm tĩnh mạch theo phác đồ chỉ định khẩn cấp", color: "text-amber-500", bg: "bg-amber-500/10" },
        { icon: ActivityIcon, text: "Hỗ trợ thở oxy qua mask/gọng kính ngay nếu có dấu hiệu suy hô hấp (SpO₂ < 94%)", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: UserCheckIcon, text: "Hội chẩn khẩn cấp với bác sĩ chuyên khoa Hô hấp/Hồi sức cấp cứu", color: "text-blue-500", bg: "bg-blue-500/10" },
      ];
    }
    if (riskStatus === "Trung bình") {
      return [
        { icon: UserCheckIcon, text: "Thăm khám trực tiếp tại cơ sở y tế để nghe phổi tìm rale ẩm/rale nổ", color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: PillIcon, text: "Sử dụng kháng sinh đường uống ngoại trú theo đơn chỉ định của bác sĩ", color: "text-amber-500", bg: "bg-amber-500/10" },
        { icon: ActivityIcon, text: "Đo SpO₂ và nhịp thở tại nhà 2 lần/ngày (Nhập viện nếu SpO₂ < 95% hoặc nhịp thở > 22 lần/phút)", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: FileTextIcon, text: "Thực hiện xét nghiệm máu (WBC) và CRP định lượng để theo dõi mức độ nhiễm trùng", color: "text-indigo-500", bg: "bg-indigo-500/10" },
      ];
    }
    return [
      { icon: PillIcon, text: "Điều trị triệu chứng tại nhà (sử dụng thuốc giảm ho, hạ sốt khi sốt > 38.5°C)", color: "text-amber-500", bg: "bg-amber-500/10" },
      { icon: ActivityIcon, text: "Theo dõi nhịp thở và thân nhiệt tại nhà (Tái khám ngay nếu sốt cao liên tục > 3 ngày hoặc khó thở)", color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { icon: UserCheckIcon, text: "Nghỉ ngơi hợp lý, uống nhiều nước ấm và giữ ấm cơ thể tránh lạnh đột ngột", color: "text-blue-500", bg: "bg-blue-500/10" },
    ];
  }, [riskStatus]);

  const risk = RISK_CONFIG[riskStatus] || RISK_CONFIG["Thấp"];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-5 pb-20 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Skeleton className="h-16 col-span-2 sm:col-span-1 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!visit) return null;

  const symptoms = visit.symptoms?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const imageUrl = visit.medicalImages?.[0]?.imageUrl || "";
  const visitDate = new Date(visit.visitDate);
  const rawResult = visit.diagnosisResult || visit.diagnoses?.[0]?.result;
  const translatedResult = rawResult === "PNEUMONIA" ? "Viêm phổi" : rawResult === "NORMAL" ? "Bình thường" : rawResult || "—";

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-20 animate-in fade-in duration-500">
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
        <Button onClick={() => handlePrint()} variant="outline" className="gap-2 text-xs font-bold h-9 px-4 rounded-xl border-border/60 hover:bg-muted">
          <Printer className="h-3.5 w-3.5" /> In kết quả
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill icon={User} label="Bệnh nhân" value={patient?.fullName || "—"} className="col-span-2 sm:col-span-1" />
          <StatPill icon={FileText} label="Mã BN" value={patient?.code || "—"} />
          <StatPill icon={Calendar} label="Ngày khám" value={visitDate.toLocaleDateString("vi-VN")} />
          <StatPill icon={ShieldAlert} label="Kết quả AI" value={translatedResult} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                >
                  {imageUrl ? <Image src={imageUrl} alt="X-ray" fill className="object-contain" unoptimized /> : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/20">
                      <BrainCircuit className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-xs font-bold">Nhấn để phóng to</div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-xs text-white/80 font-bold italic text-center">&quot;{translatedResult}&quot;</p>
                  </div>
                </div>

                {/* Sliding adjustments for PACS Simulation */}
                <div className="bg-muted/10 border border-border/40 rounded-xl p-3.5 space-y-4 mt-3">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-foreground">
                    <span>Hiệu chỉnh hình ảnh PACS</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBrightness(100);
                        setContrast(100);
                      }}
                      className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-full px-2.5 transition-all"
                    >
                      Khôi phục gốc
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brightness Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                        <span>Độ sáng (Brightness)</span>
                        <span className="font-bold text-foreground tabular-nums">{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={(val) => setBrightness(val[0])}
                        min={50}
                        max={150}
                        step={1}
                      />
                    </div>

                    {/* Contrast Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                        <span>Độ tương phản (Contrast)</span>
                        <span className="font-bold text-foreground tabular-nums">{contrast}%</span>
                      </div>
                      <Slider
                        value={[contrast]}
                        onValueChange={(val) => setContrast(val[0])}
                        min={50}
                        max={150}
                        step={1}
                      />
                    </div>
                  </div>

                  {/* Preset buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mr-1">Bộ lọc nhanh:</span>
                    {[
                      { label: "Mặc định", b: 100, c: 100 },
                      { label: "Chi tiết phổi", b: 105, c: 130 },
                      { label: "Tương phản xương", b: 90, c: 150 },
                      { label: "Mô mềm", b: 120, c: 90 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setBrightness(preset.b);
                          setContrast(preset.c);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-[9px] font-bold rounded-full border transition-all cursor-pointer",
                          brightness === preset.b && contrast === preset.c
                            ? "bg-primary/10 border-primary/20 text-primary font-extrabold"
                            : "border-border/50 hover:bg-muted/50 text-muted-foreground"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
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

            <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60 flex-1 flex flex-col">
              <CardHeader className="px-4 py-3 border-b border-border/40 bg-muted/30">
                <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-500" /> Triệu chứng lâm sàng
                  {symptoms.length > 0 && <Badge className="ml-auto bg-teal-500/10 text-teal-600 dark:text-teal-400 border-none text-[10px] font-bold">{symptoms.length} dấu hiệu</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                {symptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((s, idx) => (
                      <Badge key={idx} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-500/8 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        <Check className="h-3 w-3 mr-1.5" />{s}
                      </Badge>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground/50 italic text-center py-4">Không ghi nhận triệu chứng</p>}
              </CardContent>
            </Card>

          </div>

          {/* Full Width Bottom: Doctor Notes & AI Report (12/12) */}
          {visit.note && (
            <div className="lg:col-span-12">
              <Card className="border-border/60 shadow-sm bg-card/60">
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Ghi chú bác sĩ / Báo cáo AI chuyên gia
                  </p>
                  {renderDoctorNote(visit.note)}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <Button asChild variant="outline" className="rounded-xl px-8 h-11 font-bold text-sm border-border/60 hover:bg-muted text-muted-foreground">
          <Link href="/medical/ai-diagnosis/history"><ArrowLeft className="h-4 w-4 mr-2" /> Trở lại</Link>
        </Button>
        <Button asChild className="rounded-xl px-10 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 font-bold text-sm gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Link href={`/medical/ai-diagnosis/analysis?patientId=${visit.patientId}`}><PlusCircle className="h-4 w-4" /> Chẩn đoán mới</Link>
        </Button>
      </div>
      <ImageViewer src={imageUrl} open={showImageViewer} onOpenChange={setShowImageViewer} />

      {/* Hidden Print Component */}
      <div className="hidden">
        <PrintReport
          ref={printRef}
          visit={visit}
          patient={patient}
          totalWeightedScore={totalWeightedScore}
          hospitalName={hospitalName}
        />
      </div>
    </div>
  );
}
