"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useDiagnosis } from "@/hooks/use-diagnosis";
import { toast } from "sonner";

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
import { RISKS_MAP, SYMPTOM_LABELS, getBarColor } from "@/constants/diagnosis";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
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
  Layers,
  ChevronRight,
  FileText,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

// Extracted Components
import { ScoreRing } from "./components/score-ring";
import { WorkflowStep } from "./components/workflow-step";
import { PatientSelector } from "./components/patient-selector";
import { Curb65Calculator } from "./components/curb65-calculator";
import { ImageViewer, ImageComparisonSlider } from "@/components/medical";

// Dynamic Imports
const HistoryPanel = dynamic(() => import("./components/history-panel").then(mod => mod.HistoryPanel), {
  loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary/30" /></div>
});

export function DiagnosisForm() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"original" | "heatmap" | "overlay" | "slider">("original");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const {
    diagnosisData,
    isSubmitting,
    isSaving,
    note,
    setNote,
    availableSymptoms,
    selectedSymptoms,
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
    curb65Score,
    setCurb65Score,
    symptomWeights,
  } = useDiagnosis();

  const sortedByWeight = [...availableSymptoms].sort(
    (a, b) => (symptomWeights[b] ?? 0) - (symptomWeights[a] ?? 0)
  );
  const IMPORTANT_COUNT = 3;
  const importantThreshold = 0.10; // chỉ vào nhóm chính nếu weight >= 10%
  const importantSymptoms = sortedByWeight
    .slice(0, IMPORTANT_COUNT)
    .filter((s) => (symptomWeights[s] ?? 0) >= importantThreshold);
  const otherSymptoms = sortedByWeight.filter((s) => !importantSymptoms.includes(s));

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
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight leading-none uppercase">
              Chẩn đoán đa phương thức
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Phân tích kết hợp hình ảnh X-quang & bệnh lý lâm sàng
            </p>
          </div>
        </div>

        {/* Patient Selector */}
        <PatientSelector
          selectedPatient={selectedPatient}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          patients={patients}
          isSearching={isSearching}
          setSelectedPatient={setSelectedPatient}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          dropdownRef={dropdownRef}
          lastPatientElementRef={lastPatientElementRef}
        />
      </div>

      {/* ── Workflow Stepper ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-card/40 border border-border/40 rounded-xl px-5 py-3 overflow-x-auto">
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
        <HistoryPanel
          selectedPatient={selectedPatient}
          isLoadingVisits={isLoadingVisits}
          patientVisits={patientVisits}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* ── Main 2-Column Layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="xl:col-span-5 flex flex-col gap-4">

          {/* Dấu hiệu lâm sàng */}
          <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
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
                <div className="space-y-4">
                  {/* Triệu chứng chính */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Triệu chứng chính (tính quyết định cao)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      {importantSymptoms.map((s) => {
                        const label = SYMPTOM_LABELS[s] || s;
                        const rawWeight = symptomWeights[s];
                        const weightLabel = rawWeight != null
                          ? `${(rawWeight * 100).toFixed(1)}%`
                          : "—";
                        return (
                          <div key={s} className="flex items-start gap-2.5 p-1">
                            <Checkbox
                              id={`symptom-${s}`}
                              checked={selectedSymptoms.includes(s)}
                              onCheckedChange={(checked) => toggleSymptom(s, !!checked)}
                              className="mt-0.5 border-amber-500/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                            />
                            <div className="grid gap-1 leading-none">
                              <label
                                htmlFor={`symptom-${s}`}
                                className="text-xs font-bold text-foreground cursor-pointer select-none"
                              >
                                {label}
                              </label>
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                Trọng số AI: {weightLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Triệu chứng khác */}
                  <div className="space-y-2">
                    <div className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 pl-1">
                      Triệu chứng đi kèm
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-border/40 rounded-xl p-3 bg-background/40">
                      {otherSymptoms.map((s) => {
                        const label = SYMPTOM_LABELS[s] || s;
                        return (
                          <div key={s} className="flex items-center gap-2.5 p-1">
                            <Checkbox
                              id={`symptom-${s}`}
                              checked={selectedSymptoms.includes(s)}
                              onCheckedChange={(checked) => toggleSymptom(s, !!checked)}
                              className="border-muted-foreground/30"
                            />
                            <label
                              htmlFor={`symptom-${s}`}
                              className="text-xs font-semibold text-foreground cursor-pointer select-none"
                            >
                              {label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.length > 0 ? (
                    selectedSymptoms.map((s) => (
                      <Badge
                        key={s}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold border",
                          importantSymptoms.includes(s)
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                        )}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {SYMPTOM_LABELS[s] || s}
                        {importantSymptoms.includes(s) && (
                          <span className="ml-1 text-[9px] font-black opacity-80">
                            ({s === "fast_heart_rate" ? "30%" : s === "rusty_sputum" ? "28%" : "14%"})
                          </span>
                        )}
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
          <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm flex-1">
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
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div
                className={cn(
                  "relative aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-all",
                  diagnosisData.imagePreview
                    ? "border-transparent bg-slate-950"
                    : "border-border/40 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 cursor-pointer",
                  isDragActive && "border-primary bg-primary/5 scale-[0.99]"
                )}
                {...(diagnosisData.imagePreview ? {} : getRootProps())}
              >
                <input {...getInputProps()} />
                {diagnosisData.imagePreview ? (
                  <>
                    <Image src={diagnosisData.imagePreview} alt="X-quang gốc" fill className="object-contain" unoptimized />
                    <div className="absolute top-2 right-2 z-20 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={clearImage}
                        className="bg-black/60 hover:bg-black/80 text-white h-7 text-xs font-bold px-3 rounded-full shadow-sm border-none backdrop-blur-sm"
                      >
                        <X className="h-3 w-3 mr-1" /> Gỡ ảnh
                      </Button>
                    </div>
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
              <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-semibold">
                  <strong>Lưu ý:</strong> Hệ thống chỉ phân tích ảnh X-quang phổi thẳng (Chest X-ray AP/PA). Mọi định dạng ảnh khác sẽ cho kết quả không chính xác.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analyse Button */}
          <Button
            onClick={() => handleSubmit()}
            disabled={!canSubmit}
            className={cn(
              "w-full h-12 rounded-xl text-sm font-bold gap-3 transition-all duration-300 border border-primary/20",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              !canSubmit && "opacity-40 grayscale cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> ĐANG XỬ LÝ...</>
            ) : (
              <><Activity className="h-4 w-4" /> {hasResult ? "PHÂN TÍCH LẠI" : "PHÂN TÍCH CHẨN ĐOÁN"}</>
            )}
          </Button>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
        <div className="xl:col-span-7">
          {hasResult && diagnosisData.multimodalResult ? (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-500">

              {/* Score + Probability Card */}
              <Card className={cn("border overflow-hidden shadow-none", RISKS_MAP[diagnosisData.multimodalResult!.risk_level]?.border ?? "border-border/40")}>
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

              {/* Phân tích hình ảnh (PACS Viewer) — Full Width */}
              <Card className="border-border/60 overflow-hidden bg-card/60 animate-in fade-in duration-300">
                <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                          Phân tích hình ảnh (PACS Viewer)
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                          Công cụ trực quan hóa và hiệu chỉnh cửa sổ tia X
                        </p>
                      </div>
                    </div>

                    {/* PACS Mode Selectors */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
                      {[
                        { value: "original", label: "Gốc" },
                        { value: "heatmap", label: "Bản đồ nhiệt" },
                        { value: "overlay", label: "Chồng ảnh" },
                        { value: "slider", label: "Trượt" }
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => {
                            setViewMode(mode.value as "original" | "heatmap" | "overlay" | "slider");
                            setShowOverlay(mode.value === "overlay");
                          }}
                          className={cn(
                            "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer",
                            viewMode === mode.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Dynamic Display area with brightness/contrast filtering */}
                  <div
                    className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-border/30 group"
                    style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                  >
                    {viewMode === "slider" && diagnosisData.multimodalResult?.heatmap ? (
                      <ImageComparisonSlider
                        imageA={diagnosisData.imagePreview ?? ""}
                        imageB={diagnosisData.multimodalResult!.heatmap.startsWith("data:") ? diagnosisData.multimodalResult!.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult!.heatmap}`}
                        labelA="Phim X-quang"
                        labelB="Bản đồ nhiệt AI"
                        className="w-full h-full border-none rounded-none"
                      />
                    ) : (
                      <>
                        {viewMode === "original" && diagnosisData.imagePreview && (
                          <Image
                            src={diagnosisData.imagePreview}
                            alt="X-quang gốc"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        )}
                        {viewMode === "heatmap" && diagnosisData.multimodalResult?.heatmap && (
                          <Image
                            src={diagnosisData.multimodalResult!.heatmap.startsWith("data:") ? diagnosisData.multimodalResult!.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult!.heatmap}`}
                            alt="Grad-CAM Heatmap"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        )}
                        {viewMode === "overlay" && diagnosisData.imagePreview && diagnosisData.multimodalResult?.heatmap && (
                          <>
                            <Image src={diagnosisData.imagePreview} alt="X-quang gốc" fill className="object-contain" unoptimized />
                            <div className="absolute inset-0 z-10 opacity-70 mix-blend-screen pointer-events-none">
                              <Image
                                src={diagnosisData.multimodalResult!.heatmap.startsWith("data:") ? diagnosisData.multimodalResult!.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult!.heatmap}`}
                                alt="Heatmap Overlay"
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div className="absolute top-3 right-3 z-20">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const heatmap = diagnosisData.multimodalResult?.heatmap;
                          const src = (viewMode === "heatmap" || viewMode === "overlay" || viewMode === "slider") && heatmap
                            ? (heatmap.startsWith("data:") ? heatmap : `data:image/jpeg;base64,${heatmap}`)
                            : diagnosisData.imagePreview;
                          if (src) {
                            setViewerSrc(src);
                            setViewerOpen(true);
                          }
                        }}
                        className="bg-black/60 hover:bg-black/80 text-white h-7 text-xs font-bold px-3 rounded-full shadow-sm border-none backdrop-blur-sm"
                      >
                        <Search className="h-3 w-3 mr-1" /> Phóng to
                      </Button>
                    </div>

                    <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 pointer-events-none">
                      <Layers className="h-3 w-3 text-amber-400" />
                      Chế độ xem: {viewMode === "original" ? "Phim gốc" : viewMode === "heatmap" ? "Bản đồ nhiệt" : viewMode === "overlay" ? "Chồng ảnh" : "Thanh trượt"}
                    </div>
                  </div>

                  {/* Sliding adjustments for PACS Simulation */}
                  <div className="bg-muted/10 border border-border/40 rounded-xl p-3.5 space-y-4">
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

                  <div className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary leading-snug font-semibold">
                      Sử dụng thanh công cụ phía trên để chuyển đổi các chế độ đối chiếu hình ảnh lâm sàng và điều chỉnh cửa sổ tia X.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Curb65 Calculator */}
              <Curb65Calculator
                onApply={(summary) => setNote((prev) => (prev ? prev + summary : summary.trim()))}
                onScoreChange={setCurb65Score}
              />

              {/* AI Medical Board Report */}
              {diagnosisData.multimodalResult?.llm_report && (
                <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                        <BrainCircuit className="h-3.5 w-3.5 text-primary" /> Báo cáo hội đồng chuyên gia AI
                      </CardTitle>
                      {diagnosisData.multimodalResult!.llm_fallback ? (
                        <Badge variant="outline" className="text-[9px] font-semibold text-amber-500 border-amber-500/20 bg-amber-500/5">
                          Mô phỏng (CPU)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] font-semibold text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                          Qwen2.5 GPU
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="bg-[#fcfcfc] dark:bg-slate-950/20 border border-border/50 rounded-xl p-4 font-sans">
                      {/* Document-style clinical header */}
                      <div className="flex items-center justify-between border-b border-border/80 pb-2.5 mb-3">
                        <div className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                          Phòng khám liên kết AI • Hội đồng chẩn đoán
                        </div>
                        <div className="text-[9px] font-mono text-muted-foreground">
                          ID: DX-{selectedPatient?.id || "TEMP"}-{Date.now().toString().slice(-6)}
                        </div>
                      </div>

                      <div className="prose prose-slate dark:prose-invert max-w-none text-xs space-y-2 text-foreground leading-relaxed">
                        {diagnosisData.multimodalResult!.llm_report.split("\n").map((line, idx) => {
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
                          return <p key={idx} className="my-1">{renderInlineBold(trimmedLine)}</p>;
                        })}
                      </div>

                      {/* Document-style signature line mock */}
                      <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-border/40 text-[9px] text-muted-foreground font-semibold">
                        <div>
                          <p className="font-bold text-foreground">HỘI ĐỒNG CHUYÊN GIA AI</p>
                          <p className="italic text-[8px] opacity-75">Báo cáo tự động kiểm định</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">BÁC SĨ ĐIỀU TRỊ</p>
                          <p className="italic text-[8px] opacity-75">(Ký và xác nhận vào hồ sơ)</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-3 pt-1">
                      <Button
                        onClick={() => {
                          const reportText = `\n\n[Đánh giá của Hội đồng AI]:\n${diagnosisData.multimodalResult!.llm_report}`;
                          setNote((prev) => (prev ? prev + reportText : reportText.trim()));
                          toast.success("Đã áp dụng báo cáo của Hội đồng AI vào ghi chú bác sĩ!");
                        }}
                        size="sm"
                        className="w-full rounded-xl text-xs font-bold gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                      >
                        <Check className="h-3.5 w-3.5" /> Áp dụng báo cáo AI vào ghi chú
                      </Button>

                      <Button
                        onClick={() => handleSubmit(curb65Score)}
                        disabled={isSubmitting}
                        size="sm"
                        className="rounded-xl text-xs font-bold gap-2 bg-muted hover:bg-muted/80 border border-border/50 shrink-0 h-9"
                        title="Gửi điểm CURB-65 hiện tại để cập nhật báo cáo hội đồng AI"
                      >
                        {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-amber-500" />}
                        Cập nhật
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Doctor Notes + Save */}
              <Card className="border-border/60 overflow-hidden bg-card/60">
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
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-6 rounded-xl font-bold text-xs gap-2"
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
            <Card className="h-full min-h-[480px] border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
              <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center border border-border/40 mb-6">
                <Stethoscope className="h-10 w-10 text-muted-foreground/15" />
              </div>
              <h3 className="text-base font-black text-muted-foreground/50 uppercase tracking-tight mb-2">
                Hệ thống sẵn sàng
              </h3>
              <p className="text-sm text-muted-foreground/35 max-w-[280px] leading-relaxed font-medium">
                Hoàn thiện các bước bên trái rồi nhấn <span className="font-black text-muted-foreground/50">&ldquo;Phân tích chẩn đoán&rdquo;</span> để thực hiện phân tích.
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
      <ImageViewer src={viewerSrc} open={viewerOpen} onOpenChange={setViewerOpen} />
    </div>
  );
}
