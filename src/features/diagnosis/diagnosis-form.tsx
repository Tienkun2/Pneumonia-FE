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
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-primary/20 shrink-0 p-2 shadow-sm">
            <div className="relative w-full h-full">
              <Image src="/images/PlumoX_Logo.png" alt="PlumoX" fill className="object-contain" unoptimized />
            </div>
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

        {/* ── Inputs Section (Top) ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

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
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Triệu chứng chính */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Triệu chứng chính (tính quyết định cao)
                </div>
                <div className="grid grid-cols-1 gap-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
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
                <div className="grid grid-cols-1 gap-2.5 border border-border/40 rounded-xl p-3 bg-background/40 max-h-[240px] overflow-y-auto">
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
          </CardContent>
        </Card>

        {/* Bản phim X-quang */}
        <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
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
          <CardContent className="p-4 flex flex-col gap-3">
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
                <div className="text-center p-4 group">
                  <div className="w-10 h-10 bg-card rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-border/40 mb-3 group-hover:border-primary/30 group-hover:shadow-md transition-all">
                    <Upload className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    {isDragActive ? "Thả ảnh vào đây..." : "Kéo thả hoặc nhấn để chọn ảnh"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">Hỗ trợ JPG, PNG, DICOM</p>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed font-semibold">
                <strong>Lưu ý:</strong> Chỉ phân tích ảnh X-quang phổi thẳng (Chest X-ray AP/PA).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Curb65 Calculator */}
        <Curb65Calculator
          onScoreChange={setCurb65Score}
          patientBirthDate={selectedPatient?.dateOfBirth}
          patientId={selectedPatient?.id}
        />
      </div>

      {/* Analyse Button */}
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => handleSubmit()}
          disabled={!canSubmit}
          className={cn(
            "w-full max-w-md h-12 rounded-xl text-sm font-bold gap-3 transition-all duration-300 border border-primary/20",
            "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/10",
            !canSubmit && "opacity-45 grayscale cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> ĐANG XỬ LÝ...</>
          ) : (
            <><Activity className="h-4 w-4" /> {hasResult ? "PHÂN TÍCH LẠI" : "PHÂN TÍCH CHẨN ĐOÁN"}</>
          )}
        </Button>
      </div>

      {/* ── Results Section (Bottom) ─────────────────────────────────────── */}
      {hasResult && diagnosisData.multimodalResult ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 border-t border-border/20 pt-5 mt-5 animate-in fade-in slide-in-from-bottom-4 duration-500 items-start">
          
          {/* Left Column: PACS Viewer (7/12) */}
          <div className="xl:col-span-7">
            <Card className="border-border/60 overflow-hidden bg-card/60 animate-in fade-in duration-300 h-full flex flex-col">
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
              <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
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
          </div>

          {/* Right Column: Score, Indicators (5/12) */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            
            {/* Score + Probability Card */}
            <Card className={cn(
              "border overflow-hidden shadow-none",
              (() => {
                const res = diagnosisData.multimodalResult!;
                const scoreVal = res.final_score;
                const thr = res.threshold ?? 0.665;
                const p = Math.round(scoreVal * 100);
                const isPos = scoreVal >= thr;
                const isNear = p >= 60 && p <= 66;
                const key = res.risk_level || (isPos ? "HIGH" : (isNear ? "MEDIUM" : "LOW"));
                return RISKS_MAP[key]?.border ?? "border-border/40";
              })()
            )}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-5 sm:gap-6 lg:gap-5">
                  {/* Ring */}
                  <ScoreRing
                    value={diagnosisData.multimodalResult.final_score}
                    riskLevel={diagnosisData.multimodalResult.risk_level}
                    threshold={diagnosisData.multimodalResult.threshold}
                  />

                  {/* Probability Bars */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-black uppercase tracking-widest text-foreground whitespace-nowrap">Xác suất chi tiết</span>
                    </div>
                    {[
                      { label: "Hình ảnh X-quang", value: diagnosisData.multimodalResult.vision_probability },
                      { label: "Lâm sàng", value: diagnosisData.multimodalResult.clinical_probability },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
                            {item.label}
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

            {/* Clinical Alerts */}
            {diagnosisData.multimodalResult?.clinical_alerts && diagnosisData.multimodalResult.clinical_alerts.length > 0 && (
              <div className="space-y-2">
                {diagnosisData.multimodalResult.clinical_alerts.map((alert: string, idx: number) => {
                  const isCritical = alert.includes("CRITICAL") || alert.includes("Nguy hiểm");
                  const isWarning = alert.includes("WARNING") || alert.includes("Cảnh báo");
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 shadow-sm leading-relaxed",
                        isCritical
                          ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                          : isWarning
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      <span className="text-sm shrink-0 mt-0.5">
                        {isCritical ? "🚨" : isWarning ? "⚠️" : "ℹ️"}
                      </span>
                      <span>
                        {alert
                          .replace("CRITICAL:", "")
                          .replace("WARNING:", "")
                          .replace("Nguy hiểm:", "")
                          .replace("Cảnh báo:", "")
                          .trim()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grad-CAM Clinical Indicators Card */}
            {diagnosisData.multimodalResult && (() => {
              const res = diagnosisData.multimodalResult;
              const thresholdVal = res.threshold ?? 0.665;
              const finalScore = res.final_score;
              const isPositive = finalScore >= thresholdVal;
              const pImg = res.vision_probability;
              const pImgLabel = pImg >= 0.665 ? "Cao" : pImg >= 0.4 ? "Trung bình" : "Thấp";
              const pImgColor = pImg >= 0.665 ? "text-red-500" : pImg >= 0.4 ? "text-amber-500" : "text-emerald-500";
              const hotAreaPct = res.hot_area_pct || 0;

              const isNearThreshold = finalScore * 100 >= 60 && finalScore * 100 <= 66;

              const cleanLocation = (() => {
                const loc = res.location_label;
                if (!loc || loc === "Không khu trú rõ" || loc === "Không xác định") return "—";
                return loc
                  .replace(/đỉnh\/trên/gi, "Thùy trên")
                  .replace(/giữa/gi, "Thùy giữa")
                  .replace(/đáy\/dưới/gi, "Thùy dưới");
              })();

              const cleanPattern = (() => {
                const char = res.characteristic_label;
                if (!char || char === "Không khu trú rõ" || char === "Không xác định") return "—";
                if (char.includes("Đa ổ")) return "Nhiều vùng rải rác";
                return char;
              })();



              return (
                <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm shadow-none animate-in fade-in duration-300">
                  <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/30">
                    <CardTitle className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                      <Activity className="h-3.5 w-3.5 text-primary" /> Kết quả phân tích X-quang
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-1">
                      {/* Kết luận */}
                      <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                        <span className="text-xs font-semibold text-muted-foreground shrink-0">Kết luận</span>
                        <span className={cn("text-xs font-bold text-right", isPositive ? "text-red-500" : "text-emerald-500")}>
                          {isPositive ? "⚠️ Nghi ngờ viêm phổi — Cần đánh giá thêm" : "Không phát hiện bất thường"}
                        </span>
                      </div>

                      {/* Mức độ nghi ngờ */}
                      <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                        <span className="text-xs font-semibold text-muted-foreground shrink-0">Mức độ nghi ngờ viêm phổi</span>
                        <span className={cn("text-xs font-bold text-right", pImgColor)}>
                          {pImgLabel} ({(pImg * 100).toFixed(0)}%)
                        </span>
                      </div>

                      {/* Vùng bất thường */}
                      <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                        <span className="text-xs font-semibold text-muted-foreground shrink-0">Vùng phổi bất thường</span>
                        <span className="text-xs font-bold text-foreground text-right">
                          {hotAreaPct > 0 ? `${hotAreaPct.toFixed(1)}% diện tích` : "Không phát hiện"}
                        </span>
                      </div>

                      {/* Vị trí nghi ngờ */}
                      <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                        <span className="text-xs font-semibold text-muted-foreground shrink-0">Vị trí nghi ngờ</span>
                        <span className="text-xs font-bold text-foreground text-right">
                          {cleanLocation}
                        </span>
                      </div>

                      {/* Dạng tổn thương */}
                      <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                        <span className="text-xs font-semibold text-muted-foreground shrink-0">Dạng tổn thương</span>
                        <span className="text-xs font-bold text-foreground text-right">
                          {cleanPattern}
                        </span>
                      </div>



                      {/* Lưu ý */}
                      {isNearThreshold && (
                        <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                          <span className="text-xs font-semibold text-muted-foreground shrink-0">Lưu ý</span>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 text-right">
                            Kết quả sát ngưỡng, nên kết hợp triệu chứng lâm sàng
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Detailed Description */}
                    {res.description && (
                      <div className="pt-3 border-t border-border/40 mt-1">
                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                          {res.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {/* AI Medical Board Report */}
          {diagnosisData.multimodalResult?.llm_report && (
            <Card className="xl:col-span-7 border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm animate-in fade-in duration-300">
                <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                      <BrainCircuit className="h-3.5 w-3.5 text-primary" /> Báo cáo hội chẩn chuyên gia
                    </CardTitle>
                    {diagnosisData.multimodalResult!.llm_fallback ? (
                      <Badge variant="outline" className="text-[9px] font-semibold text-amber-500 border-amber-500/20 bg-amber-500/5">
                        Cơ sở dữ liệu lâm sàng
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] font-semibold text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                        Hệ chuyên gia AI (Multimodal)
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="bg-[#fcfcfc] dark:bg-slate-950/20 border border-border/50 rounded-xl p-4 font-sans">
                    {/* Document-style clinical header */}
                    <div className="border-b border-border/80 pb-2.5 mb-3">
                      <div className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                        Hệ thống hỗ trợ lâm sàng PlumoX • Hội đồng y khoa
                      </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none text-xs space-y-2 text-foreground leading-relaxed max-h-[650px] overflow-y-auto">
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
                        <p className="font-bold text-foreground">HỘI ĐỒNG CHUYÊN KHOA PLUMOX</p>
                        <p className="italic text-[8px] opacity-75">Kết quả kiểm định tự động</p>
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
                        const reportText = `\n\n[Báo cáo Hội chẩn Đa phương thức (PlumoX)]:\n${diagnosisData.multimodalResult!.llm_report}`;
                        setNote((prev) => (prev ? prev + reportText : reportText.trim()));
                        toast.success("Đã áp dụng báo cáo hội chẩn vào ghi chú bác sĩ!");
                      }}
                      size="sm"
                      className="w-full rounded-xl text-xs font-bold gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none"
                    >
                      <Check className="h-3.5 w-3.5" /> Áp dụng báo cáo hội chẩn vào ghi chú
                    </Button>

                    <Button
                      onClick={() => handleSubmit(curb65Score)}
                      disabled={isSubmitting}
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-2 bg-muted hover:bg-muted/80 border border-border/50 shrink-0 h-9 shadow-none"
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
          <Card className="xl:col-span-5 border-border/60 overflow-hidden bg-card/60">
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
        <div className="mt-5 border-t border-border/20 pt-5 animate-in fade-in duration-300">
          <Card className="h-full min-h-[200px] border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-border/40 p-2.5 mb-4 shadow-sm">
              <div className="relative w-full h-full opacity-60">
                <Image src="/images/PlumoX_Logo.png" alt="PlumoX" fill className="object-contain" unoptimized />
              </div>
            </div>
            <h3 className="text-xs font-black text-muted-foreground/50 uppercase tracking-tight mb-1">
              Hệ thống sẵn sàng
            </h3>
            <p className="text-xs text-muted-foreground/35 max-w-[280px] leading-relaxed font-medium mb-4">
              Hoàn thiện các bước nhập liệu phía trên rồi nhấn <span className="font-black text-muted-foreground/50">&ldquo;Phân tích chẩn đoán&rdquo;</span> để thực hiện phân tích.
            </p>

            {/* Mini checklist */}
            <div className="flex flex-wrap justify-center gap-6 text-left">
              {[
                { label: "Chọn bệnh nhân", done: step1Done },
                { label: "Chọn triệu chứng", done: step3Done },
                { label: "Tải ảnh X-quang", done: step2Done },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all", item.done ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground/30 border border-border/40")}>
                    {item.done ? <Check className="h-2.5 w-2.5" /> : <span className="w-1 h-1 rounded-full bg-current" />}
                  </div>
                  <span className={cn("text-[10px] font-semibold transition-colors", item.done ? "text-foreground" : "text-muted-foreground/40")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      <ImageViewer src={viewerSrc} open={viewerOpen} onOpenChange={setViewerOpen} />
    </div>
  );
}
