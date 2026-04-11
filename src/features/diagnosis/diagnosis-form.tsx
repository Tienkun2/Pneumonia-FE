"use client";

import Image from "next/image";
import { useDiagnosis } from "@/hooks/use-diagnosis";
import { RISKS_MAP, SYMPTOM_LABELS, getBarColor } from "@/constants/diagnosis";
import { AnimatedScore } from "@/components/diagnosis/animated-score";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-500">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <BrainCircuit className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight leading-none uppercase">Chẩn đoán đa phương thức</h1>
          </div>
        </div>

        {/* Integrated Patient Selector */}
        <div className="relative flex items-center min-w-[320px]" ref={dropdownRef}>
          {selectedPatient ? (
            <div className="flex items-center justify-between w-full bg-card border border-border/60 rounded-xl px-3 py-1.5 shadow-sm animate-in fade-in zoom-in-95 duration-300">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[11px] font-bold">
                    {selectedPatient.fullName.charAt(0)}
                  </div>
                  <div className="leading-tight">
                    <p className="text-[12px] font-bold text-foreground">{selectedPatient.fullName}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{selectedPatient.code}</p>
                  </div>
               </div>
               <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)} className={cn("h-7 w-7 rounded-md", showHistory ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
                   <History className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)} className="h-7 w-7 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                    <X className="h-4 w-4" />
                 </Button>
               </div>
            </div>
          ) : (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
              <Input
                placeholder="Tìm bệnh nhân (mã hoặc tên)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-9 h-10 border-border/60 rounded-xl bg-card focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/40 text-[13px] font-medium placeholder:text-muted-foreground/40 w-full shadow-sm transition-all"
              />
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-popover border border-border shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="p-2 border-b border-border/40 bg-muted/40">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2">Kết quả tìm kiếm</p>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {patients.map((patient, index) => (
                      <button
                        key={patient.id}
                        ref={index === patients.length - 1 ? lastPatientElementRef : null}
                        onClick={() => { setSelectedPatient(patient); setIsDropdownOpen(false); setSearchQuery(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center justify-between border-b border-border/40 last:border-0"
                      >
                        <div>
                          <p className="text-[12px] font-bold text-foreground">{patient.fullName}</p>
                          <p className="text-[10px] font-bold text-muted-foreground/70 uppercase">{patient.code} • {patient.phone}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold h-5 border-border/60 bg-muted/30">{patient.gender === "MALE" ? "NAM" : "NỮ"}</Badge>
                      </button>
                    ))}
                    {isSearching && <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" /></div>}
                    {patients.length === 0 && !isSearching && <div className="p-6 text-center text-[12px] text-muted-foreground font-medium italic">Không tìm thấy bệnh nhân</div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Patient History Dropdown Area ── */}
      {showHistory && selectedPatient && (
        <Card className="mb-6 animate-in slide-in-from-top-4 duration-500 overflow-hidden border-border/60 shadow-2xl bg-card/80 backdrop-blur-xl">
           <CardHeader className="bg-muted/40 border-b border-border/40 flex flex-row items-center justify-between px-6 py-2.5">
              <CardTitle className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                 <History className="h-4 w-4 text-primary" /> Nhật ký chẩn đoán
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500">
                 <X className="h-4 w-4" />
              </Button>
           </CardHeader>
           <CardContent className="p-5 max-h-[350px] overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingVisits ? (
                 <div className="col-span-full py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/20" />
                 </div>
              ) : patientVisits.length > 0 ? (
                patientVisits.map((visit) => (
                  <div key={visit.id} className="p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/40 hover:bg-card/60 transition-all cursor-default group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                         <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                         <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                           {format(new Date(visit.visitDate), "dd/MM/yyyy", { locale: vi })}
                         </span>
                      </div>
                      {visit.diagnoses?.[0] && (
                        <Badge className={cn("text-[8px] font-black uppercase px-2 shadow-none border-none", visit.diagnoses[0].result === "PNEUMONIA" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                          {visit.diagnoses[0].result}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground/90 line-clamp-2 italic leading-relaxed transition-colors">&quot;{visit.symptoms || "—"}&quot;</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground/40 font-medium italic">Chưa có lịch sử khám</div>
              )}
           </CardContent>
        </Card>
      )}

      {/* ── Main Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* ── LEFT COLUMN: Input Data ───────────────────── */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50">
            <CardHeader className="p-0 border-b border-border/40 bg-muted/30">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-teal-500" />
                  </div>
                  <CardTitle className="text-[13px] font-bold text-foreground uppercase tracking-tight">Dấu hiệu lâm sàng</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsSymptomEditing(!isSymptomEditing)} className="h-7 text-[11px] font-bold text-primary px-3 rounded-full hover:bg-primary/10">
                  {isSymptomEditing ? "Xong" : "Chọn nhanh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isSymptomEditing ? (
                <div className="flex flex-wrap gap-2">
                  {availableSymptoms.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s, !selectedSymptoms.includes(s))}
                      className={cn(
                        "px-4 py-2 rounded-full border text-[11px] font-bold transition-all flex items-center gap-2",
                        selectedSymptoms.includes(s)
                          ? "bg-primary/10 border-primary/40 text-primary shadow-sm"
                          : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted"
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
                      <Badge key={s} variant="secondary" className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-muted text-foreground border-none">
                        {SYMPTOM_LABELS[s] || s}
                      </Badge>
                    ))
                  ) : (
                    <div className="w-full py-2 text-center text-muted-foreground/40 text-[11px] italic font-medium">Chưa chọn triệu chứng</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50 flex flex-col">
            <CardHeader className="p-0 border-b border-border/40 bg-muted/30">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <CardTitle className="text-[13px] font-bold text-foreground uppercase tracking-tight">Bản phim X-quang</CardTitle>
                </div>
                {diagnosisData.multimodalResult && (
                  <div className="flex items-center gap-2 bg-muted/50 px-2 py-0.5 rounded-full border border-border/40 shadow-sm">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Overlay</span>
                    <Switch checked={showOverlay} onCheckedChange={setShowOverlay} className="scale-75" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div {...getRootProps()} className={cn("relative aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-all", diagnosisData.imagePreview ? "border-transparent bg-slate-950" : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-primary/40", isDragActive && "border-primary bg-primary/5")}>
                <input {...getInputProps()} />
                {diagnosisData.imagePreview ? (
                  <>
                    <Image src={diagnosisData.imagePreview} alt="Original X-ray" fill className="object-contain" unoptimized />
                    {showOverlay && diagnosisData.multimodalResult?.heatmap && (
                      <div className="absolute inset-0 z-10 opacity-70 mix-blend-screen pointer-events-none">
                        <Image src={diagnosisData.multimodalResult.heatmap.startsWith("data:") ? diagnosisData.multimodalResult.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult.heatmap}`} alt="Heatmap Overlay" fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Button variant="secondary" size="sm" onClick={clearImage} className="bg-background/80 hover:bg-background h-7 text-[10px] font-bold px-3 rounded-full shadow-sm text-red-500 border-none transition-colors">
                        <X className="h-3.5 w-3.5 mr-1" /> Gỡ ảnh
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center mx-auto shadow-sm border border-border/40 mb-4 group-hover:border-primary/40 transition-all">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground">Tải ảnh phim chụp</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">JPG, PNG, DICOM (MAX 10MB)</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!diagnosisData.multimodalResult && (
            <Button onClick={handleSubmit} disabled={!canSubmit} className={cn("w-full h-12 rounded-xl text-xs font-bold gap-3 shadow-lg transition-all", "bg-blue-600 hover:bg-blue-700 shadow-blue-100", !canSubmit && "opacity-50 grayscale shadow-none")}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              {isSubmitting ? "ĐANG XỬ LÝ..." : "PHÂN TÍCH CHẨN ĐOÁN"}
            </Button>
          )}
        </div>

        {/* ── RIGHT COLUMN: AI Analysis ─────────────────── */}
        <div className="xl:col-span-7">
          {diagnosisData.multimodalResult ? (
            <div className="space-y-3 animate-in slide-in-from-right-2 duration-500">
              <Card className={cn("border-none p-3.5 flex flex-row items-center justify-between gap-4 shadow-sm", RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.bg)}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-white/60 backdrop-blur-sm shadow-sm")}>
                    <BrainCircuit className={cn("h-7 w-7", RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.color)} />
                  </div>
                  <div className="leading-tight">
                    <h3 className="text-[22px] font-black leading-none mb-1 tracking-tighter">
                      <AnimatedScore value={diagnosisData.multimodalResult.final_score} className={RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.color} />
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.dot, "animate-pulse")} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.color)}>
                        {RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.label}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50">
                <CardHeader className="py-2 px-4 border-b border-border/40 bg-muted/30">
                  <CardTitle className="text-[10px] font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                    <Activity className="h-3 w-3 text-primary" /> Xác suất chi tiết
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-3.5 space-y-3">
                  {[
                    { label: "Hình ảnh", value: diagnosisData.multimodalResult.vision_probability },
                    { label: "Lâm sàng", value: diagnosisData.multimodalResult.clinical_probability },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider w-16 shrink-0">{item.label}</p>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted shadow-inner">
                        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", getBarColor(item.value))} style={{ width: `${item.value * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-foreground w-10 text-right">{(item.value * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50">
                <CardHeader className="py-2 px-4 border-b border-border/40 bg-muted/30">
                  <CardTitle className="text-[10px] font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                    <Zap className="h-3 w-3 text-amber-500" /> Trực quan tổn thương
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="relative aspect-[16/9] bg-slate-950 rounded-lg overflow-hidden border border-border/40 shadow-md">
                      <Image src={diagnosisData.multimodalResult.heatmap.startsWith("data:") ? diagnosisData.multimodalResult.heatmap : `data:image/jpeg;base64,${diagnosisData.multimodalResult.heatmap}`} alt="Heatmap" fill className="object-contain" unoptimized />
                    </div>
                    <div className="space-y-2.5 text-[9px] font-bold text-muted-foreground/80">
                      <div className="flex items-center gap-2 px-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" /> Nguy cơ cao</div>
                      <div className="flex items-center gap-2 px-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]" /> Nghi ngờ thâm nhiễm</div>
                      <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                        <p className="text-[9px] text-primary leading-snug font-bold">
                          Dùng <strong>Overlay</strong> (cột trái) để đối chiếu phim gốc.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm p-4 space-y-3 bg-card/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <CardTitle className="text-[10px] font-bold text-foreground uppercase tracking-tight">Kết luận bác sĩ</CardTitle>
                </div>
                <Textarea placeholder="Ghi chú lâm sàng..." className="bg-muted/30 border-border/60 text-[11px] min-h-[60px] rounded-lg focus-visible:ring-primary/20 text-foreground" value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[9px] text-muted-foreground/50 italic">Lưu tự động vào EMR.</p>
                  <Button onClick={handleSaveVisit} disabled={isSaving || !selectedPatient} className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-5 rounded-full font-bold text-[10px] shadow-sm">
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />} LƯU HỒ SƠ
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="h-full min-h-[500px] border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
              <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-lg mb-5 border border-border/40">
                <BrainCircuit className="h-8 w-8 text-muted-foreground/20" />
              </div>
              <h3 className="text-base font-black text-muted-foreground/60 uppercase tracking-tighter">Đang đợi phân tích</h3>
              <p className="text-[11px] text-muted-foreground/40 mt-2 max-w-[240px] leading-relaxed font-bold">
                Tải ảnh và chọn triệu chứng, sau đó nhấn &quot;PHÂN TÍCH&quot; để bắt đầu quy trình chẩn đoán đa phương thức.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
