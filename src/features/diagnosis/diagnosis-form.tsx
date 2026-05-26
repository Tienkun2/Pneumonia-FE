"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useDiagnosis } from "@/hooks/use-diagnosis";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Extracted Components
import { ScoreRing } from "./components/score-ring";
import { WorkflowStep } from "./components/workflow-step";
import { PatientSelector } from "./components/patient-selector";
import { Curb65Calculator } from "./components/curb65-calculator";
import { ImageViewer } from "@/components/medical/image-viewer";

// Dynamic Imports
const HistoryPanel = dynamic(() => import("./components/history-panel").then(mod => mod.HistoryPanel), {
  loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary/30" /></div>
});

export function DiagnosisForm() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | undefined>(undefined);

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
                    <div className="absolute top-2 right-2 z-20 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const heatmap = diagnosisData.multimodalResult?.heatmap;
                          const src = showOverlay && heatmap
                            ? (heatmap.startsWith("data:") ? heatmap : `data:image/jpeg;base64,${heatmap}`)
                            : diagnosisData.imagePreview;
                          setViewerSrc(src);
                          setViewerOpen(true);
                        }}
                        className="bg-black/60 hover:bg-black/80 text-white h-7 text-xs font-bold px-3 rounded-full shadow-sm border-none backdrop-blur-sm"
                      >
                        <Search className="h-3 w-3 mr-1" /> Tinh chỉnh
                      </Button>
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
                  <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-border/30 shadow-lg group">
                    <Image
                      src={diagnosisData.multimodalResult.heatmap.startsWith("data:") ? diagnosisData.multimodalResult.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult.heatmap}`}
                      alt="Grad-CAM Heatmap"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const heatmap = diagnosisData.multimodalResult?.heatmap;
                          if (heatmap) {
                            setViewerSrc(heatmap.startsWith("data:") ? heatmap : `data:image/jpeg;base64,${heatmap}`);
                            setViewerOpen(true);
                          }
                        }}
                        className="bg-black/60 hover:bg-black/80 text-white h-7 text-xs font-bold px-3 rounded-full shadow-sm border-none backdrop-blur-sm"
                      >
                        <Search className="h-3 w-3 mr-1" /> Phóng to
                      </Button>
                    </div>
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

              {/* Curb65 Calculator */}
              <Curb65Calculator
                onApply={(summary) => setNote((prev) => (prev ? prev + summary : summary.trim()))}
              />

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
      <ImageViewer src={viewerSrc} open={viewerOpen} onOpenChange={setViewerOpen} />
    </div>
  );
}
