"use client";

import Image from "next/image";
import { useDiagnosis } from "@/hooks/use-diagnosis";
import { RISKS_MAP, SYMPTOM_LABELS, getBarColor } from "@/constants/diagnosis";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Upload,
  Loader2,
  Activity,
  Stethoscope,
  AlertTriangle,
  Check,
  BrainCircuit,
  X,
  ImageIcon,
  Zap,
  Search,
  History,
  Calendar,
  ChevronRight,
  FileText,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

function ScoreRing({
  value,
  riskLevel,
}: {
  value: number;
  riskLevel: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const risk = RISKS_MAP[riskLevel] ?? RISKS_MAP["Unknown"];
  const pct = Math.round(value * 100);

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

  const strokeColor =
    riskLevel === "HIGH"
      ? "#ef4444"
      : riskLevel === "MEDIUM"
      ? "#f59e0b"
      : "#10b981";

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/30"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.05s linear", filter: `drop-shadow(0 0 6px ${strokeColor}55)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-black tabular-nums leading-none", risk.color)}>
            {displayed}%
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Nguy cơ
          </span>
        </div>
      </div>
      <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full border", risk.border, risk.bg)}>
        <div className={cn("w-2 h-2 rounded-full animate-pulse", risk.dot)} />
        <span className={cn("text-xs font-black uppercase tracking-wider", risk.color)}>
          {risk.label}
        </span>
      </div>
    </div>
  );
}

function WorkflowStep({
  step,
  label,
  done,
  active,
}: {
  step: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
          done
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
            : active
            ? "bg-primary/15 text-primary border-2 border-primary/40"
            : "bg-muted text-muted-foreground border border-border/60"
        )}
      >
        {done ? <Check className="h-3 w-3" /> : step}
      </div>
      <span
        className={cn(
          "text-xs font-bold transition-colors",
          done || active ? "text-foreground" : "text-muted-foreground/50"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function DiagnosisForm() {
  const {
    diagnosisData,
    isSubmitting,
    isSaving,
    note,
    setNote,
    availableSymptoms,
    selectedSymptoms,
    showOverlay,
    setShowOverlay,
    isSymptomEditing,
    setIsSymptomEditing,
    searchQuery,
    setSearchQuery,
    patients,
    isSearching,
    selectedPatient,
    setSelectedPatient,
    patientVisits,
    isLoadingVisits,
    showHistory,
    setShowHistory,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    lastPatientElementRef,
    handleDrop,
    handleSubmit,
    clearImage,
    toggleSymptom,
    handleSaveVisit,
    canSubmit,
  } = useDiagnosis();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".dcm"] },
    maxFiles: 1,
  });

  const hasImage = !!diagnosisData.imagePreview;
  const hasSymptoms = selectedSymptoms.length > 0;
  const hasResult = !!diagnosisData.multimodalResult;

  // Workflow steps
  const step1Done = !!selectedPatient;
  const step2Done = hasImage;
  const step3Done = hasSymptoms;
  const step4Done = hasResult;

  const activeStep = !step1Done ? 1 : !step2Done ? 2 : !step3Done ? 3 : !step4Done ? 4 : 5;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-500">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
            <BrainCircuit className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight leading-none uppercase">
              Chẩn đoán đa phương thức
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Phân tích X-quang kết hợp triệu chứng lâm sàng bằng AI
            </p>
          </div>
        </div>

        {/* Patient Selector */}
        <div className="relative flex items-center min-w-[300px]" ref={dropdownRef}>
          {selectedPatient ? (
            <div className="flex items-center justify-between w-full bg-card border border-border/60 rounded-xl px-3 py-2 shadow-sm animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[11px] font-black">
                  {selectedPatient.fullName.charAt(0)}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-foreground">{selectedPatient.fullName}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{selectedPatient.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(!showHistory)}
                  className={cn("h-7 w-7 rounded-md", showHistory ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <History className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPatient(null)}
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
              <Input
                placeholder="Tìm bệnh nhân (mã hoặc tên)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-9 h-10 border-border/60 rounded-xl bg-card focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/40 text-sm font-medium placeholder:text-muted-foreground/40 w-full shadow-sm"
              />
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-popover border border-border shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="p-2 border-b border-border/40 bg-muted/40">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2">Kết quả tìm kiếm</p>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {patients.map((patient, index) => (
                      <button
                        key={patient.id}
                        ref={index === patients.length - 1 ? lastPatientElementRef : null}
                        onClick={() => { setSelectedPatient(patient); setIsDropdownOpen(false); setSearchQuery(""); }}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center justify-between border-b border-border/40 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-bold text-foreground">{patient.fullName}</p>
                          <p className="text-xs font-semibold text-muted-foreground/70 uppercase">{patient.code} • {patient.phone}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold h-5 border-border/60 bg-muted/30">
                          {patient.gender === "MALE" ? "NAM" : "NỮ"}
                        </Badge>
                      </button>
                    ))}
                    {isSearching && <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" /></div>}
                    {patients.length === 0 && !isSearching && (
                      <div className="p-6 text-center text-sm text-muted-foreground font-medium italic">Không tìm thấy bệnh nhân</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Workflow Stepper ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-card/60 border border-border/50 rounded-xl px-5 py-3 shadow-sm overflow-x-auto">
        <WorkflowStep step={1} label="Chọn bệnh nhân" done={step1Done} active={activeStep === 1} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
        <WorkflowStep step={2} label="Tải ảnh X-quang" done={step2Done} active={activeStep === 2} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
        <WorkflowStep step={3} label="Chọn triệu chứng" done={step3Done} active={activeStep === 3} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
        <WorkflowStep step={4} label="Phân tích AI" done={step4Done} active={activeStep === 4} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
        <WorkflowStep step={5} label="Lưu hồ sơ" done={false} active={activeStep === 5} />
      </div>

      {/* ── Patient History Panel ─────────────────────────────────────────── */}
      {showHistory && selectedPatient && (
        <Card className="animate-in slide-in-from-top-4 duration-500 overflow-hidden border-border/60 shadow-xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="bg-muted/40 border-b border-border/40 flex flex-row items-center justify-between px-5 py-3">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Nhật ký chẩn đoán — {selectedPatient.fullName}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-500">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoadingVisits ? (
              <div className="col-span-full py-10 text-center">
                <Loader2 className="h-7 w-7 animate-spin mx-auto text-primary/30" />
              </div>
            ) : patientVisits.length > 0 ? (
              patientVisits.map((visit) => (
                <div key={visit.id} className="p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/30 hover:bg-card/60 transition-all cursor-default group">
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        {format(new Date(visit.visitDate), "dd/MM/yyyy", { locale: vi })}
                      </span>
                    </div>
                    {visit.diagnoses?.[0] && (
                      <Badge className={cn("text-[9px] font-black uppercase px-2 shadow-none border-none", visit.diagnoses[0].result === "PNEUMONIA" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                        {visit.diagnoses[0].result}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 line-clamp-2 italic leading-relaxed transition-colors">
                    &ldquo;{visit.symptoms || "—"}&rdquo;
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-muted-foreground/40 font-medium italic text-sm">Chưa có lịch sử khám</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Main 2-Column Layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="xl:col-span-5 flex flex-col gap-4">

          {/* Dấu hiệu lâm sàng */}
          <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="p-0 border-b border-border/40 bg-muted/30">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">Dấu hiệu lâm sàng</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {selectedSymptoms.length > 0 ? `${selectedSymptoms.length} triệu chứng được chọn` : "Chưa chọn triệu chứng nào"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSymptomEditing(!isSymptomEditing)}
                  className={cn(
                    "h-7 text-xs font-bold px-3 rounded-full transition-all",
                    isSymptomEditing ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-primary hover:bg-primary/10"
                  )}
                >
                  {isSymptomEditing ? (
                    <><Check className="h-3 w-3 mr-1" />Hoàn tất</>
                  ) : (
                    "Chỉnh sửa"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 min-h-[120px]">
              {isSymptomEditing ? (
                <div className="flex flex-wrap gap-2">
                  {availableSymptoms.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s, !selectedSymptoms.includes(s))}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5",
                        selectedSymptoms.includes(s)
                          ? "bg-primary/10 border-primary/40 text-primary shadow-sm"
                          : "bg-background border-border/60 text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {selectedSymptoms.includes(s) && <Check className="h-3 w-3" />}
                      {SYMPTOM_LABELS[s] || s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.length > 0 ? (
                    selectedSymptoms.map((s) => (
                      <Badge key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                        <Check className="h-3 w-3 mr-1" />
                        {SYMPTOM_LABELS[s] || s}
                      </Badge>
                    ))
                  ) : (
                    <div className="w-full py-6 flex flex-col items-center gap-2 text-muted-foreground/40">
                      <Stethoscope className="h-8 w-8 opacity-20" />
                      <p className="text-xs italic font-medium">Nhấn &ldquo;Chỉnh sửa&rdquo; để thêm triệu chứng</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bản phim X-quang */}
          <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm flex-1">
            <CardHeader className="p-0 border-b border-border/40 bg-muted/30">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">Bản phim X-quang</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">JPG, PNG, DICOM (tối đa 10 MB)</p>
                  </div>
                </div>
                {diagnosisData.multimodalResult && (
                  <div className="flex items-center gap-2 bg-muted/50 px-2.5 py-1 rounded-full border border-border/40">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Overlay</span>
                    <Switch checked={showOverlay} onCheckedChange={setShowOverlay} className="scale-75" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div
                {...getRootProps()}
                className={cn(
                  "relative aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer",
                  diagnosisData.imagePreview
                    ? "border-transparent bg-slate-950"
                    : "border-border/40 bg-muted/10 hover:bg-muted/30 hover:border-primary/30",
                  isDragActive && "border-primary bg-primary/5 scale-[0.99]"
                )}
              >
                <input {...getInputProps()} />
                {diagnosisData.imagePreview ? (
                  <>
                    <Image src={diagnosisData.imagePreview} alt="X-quang gốc" fill className="object-contain" unoptimized />
                    {showOverlay && diagnosisData.multimodalResult?.heatmap && (
                      <div className="absolute inset-0 z-10 opacity-70 mix-blend-screen pointer-events-none">
                        <Image
                          src={diagnosisData.multimodalResult.heatmap.startsWith("data:") ? diagnosisData.multimodalResult.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult.heatmap}`}
                          alt="Heatmap Overlay"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-20">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={clearImage}
                        className="bg-black/60 hover:bg-black/80 text-white h-7 text-xs font-bold px-3 rounded-full shadow-sm border-none backdrop-blur-sm"
                      >
                        <X className="h-3 w-3 mr-1" /> Gỡ ảnh
                      </Button>
                    </div>
                    {showOverlay && (
                      <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-amber-400" />
                        Đang xem Heatmap Overlay
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 group">
                    <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-border/40 mb-4 group-hover:border-primary/30 group-hover:shadow-md transition-all">
                      <Upload className="h-6 w-6 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {isDragActive ? "Thả ảnh vào đây..." : "Kéo thả hoặc nhấn để chọn ảnh"}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">Hỗ trợ JPG, PNG, DICOM</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analyse Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "w-full h-12 rounded-xl text-sm font-bold gap-3 shadow-lg transition-all duration-300",
              "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20",
              !canSubmit && "opacity-40 grayscale shadow-none cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> ĐANG XỬ LÝ...</>
            ) : (
              <><BrainCircuit className="h-4 w-4" /> {hasResult ? "PHÂN TÍCH LẠI" : "PHÂN TÍCH CHẨN ĐOÁN"}</>
            )}
          </Button>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
        <div className="xl:col-span-7">
          {hasResult && diagnosisData.multimodalResult ? (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-500">

              {/* Score + Probability Card */}
              <Card className={cn("border overflow-hidden shadow-md", RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.border ?? "border-border/60")}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Ring */}
                    <ScoreRing
                      value={diagnosisData.multimodalResult.final_score}
                      riskLevel={diagnosisData.multimodalResult.risk_level}
                    />

                    {/* Probability Bars */}
                    <div className="flex-1 w-full space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Xác suất chi tiết</span>
                      </div>
                      {[
                        { label: "Hình ảnh X-quang", value: diagnosisData.multimodalResult.vision_probability, icon: "🫁" },
                        { label: "Lâm sàng", value: diagnosisData.multimodalResult.clinical_probability, icon: "💉" },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <span>{item.icon}</span> {item.label}
                            </span>
                            <span className={cn("text-sm font-black tabular-nums", getBarColor(item.value).replace("bg-", "text-"))}>
                              {(item.value * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden bg-muted/60 shadow-inner">
                            <div
                              className={cn("h-full rounded-full transition-all duration-1000 ease-out", getBarColor(item.value))}
                              style={{ width: `${item.value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Heatmap Card — Full Width */}
              <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60">
                <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                      <Zap className="h-3.5 w-3.5 text-amber-500" /> Trực quan tổn thương (Grad-CAM)
                    </CardTitle>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]" />
                        Nguy cơ cao
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                        Nghi ngờ
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {/* Full-width heatmap image */}
                  <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-border/30 shadow-lg">
                    <Image
                      src={diagnosisData.multimodalResult.heatmap.startsWith("data:") ? diagnosisData.multimodalResult.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult.heatmap}`}
                      alt="Grad-CAM Heatmap"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {/* Tip */}
                  <div className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary leading-snug font-semibold">
                      Bật <strong>Overlay</strong> (cột trái) để chồng heatmap lên phim gốc và đối chiếu vùng tổn thương.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Notes + Save */}
              <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60">
                <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/30">
                  <CardTitle className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Kết luận bác sĩ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Textarea
                    placeholder="Nhập ghi chú lâm sàng, nhận định chẩn đoán và hướng điều trị đề xuất..."
                    className="bg-muted/20 border-border/60 text-sm min-h-[110px] rounded-lg focus-visible:ring-primary/20 text-foreground resize-none leading-relaxed"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {!selectedPatient && (
                        <Badge variant="outline" className="text-[9px] font-semibold text-amber-500 border-amber-500/30 bg-amber-500/5">
                          Chưa chọn bệnh nhân
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={handleSaveVisit}
                      disabled={isSaving || !selectedPatient}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-6 rounded-xl font-bold text-xs shadow-sm shadow-primary/20 gap-2"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Lưu hồ sơ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Empty State */
            <Card className="h-full min-h-[480px] border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-muted/5 to-muted/20">
              <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center shadow-xl border border-border/30 mb-6">
                <BrainCircuit className="h-10 w-10 text-muted-foreground/15" />
              </div>
              <h3 className="text-base font-black text-muted-foreground/50 uppercase tracking-tight mb-2">
                Chờ phân tích
              </h3>
              <p className="text-sm text-muted-foreground/35 max-w-[280px] leading-relaxed font-medium">
                Hoàn thiện các bước bên trái rồi nhấn <span className="font-black text-muted-foreground/50">&ldquo;Phân tích chẩn đoán&rdquo;</span> để AI xử lý.
              </p>

              {/* Mini checklist */}
              <div className="mt-8 space-y-2.5 text-left">
                {[
                  { label: "Chọn bệnh nhân", done: step1Done },
                  { label: "Tải ảnh X-quang", done: step2Done },
                  { label: "Chọn triệu chứng", done: step3Done },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all", item.done ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground/30 border border-border/40")}>
                      {item.done ? <Check className="h-3 w-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={cn("text-xs font-semibold transition-colors", item.done ? "text-foreground" : "text-muted-foreground/40")}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
