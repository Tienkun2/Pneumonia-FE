"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setImagePreview,
  setPredictionResult,
  setMultimodalResult,
} from "@/store/slices/diagnosisSlice";
import { AiService } from "@/services/ai-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";
import { PatientService } from "@/services/patient-service";
import { VisitService } from "@/services/visit-service";
import { Patient } from "@/types/patient";
import { Visit } from "@/types/diagnosis";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Upload,
  Loader2,
  Activity,
  FileImage,
  Stethoscope,
  AlertTriangle,
  Check,
  BrainCircuit,
  X,
  ImageIcon,
  Zap,
  Search,
  UserCircle,
  Hash,
  History,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

/* ─── Constants ─────────────────────────────────────────────────── */
const RISKS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  LOW: { label: "Nguy cơ thấp", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  MEDIUM: { label: "Nguy cơ trung bình", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" },
  HIGH: { label: "Nguy cơ cao", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500" },
  Unknown: { label: "Chưa xác định", color: "text-muted-foreground", bg: "bg-muted/40 border-border/40", dot: "bg-muted-foreground" },
};

const SYMPTOM_LABELS: Record<string, string> = {
  chills: "Rét run",
  fatigue: "Mệt mỏi",
  cough: "Ho",
  high_fever: "Sốt cao",
  breathlessness: "Khó thở",
  phlegm: "Đờm",
  chest_pain: "Đau ngực",
  fast_heart_rate: "Nhịp tim nhanh",
  rusty_sputum: "Đờm màu gỉ sắt",
  malaise: "Uể oải",
};

const getBarColor = (score: number) => {
  if (score > 0.7) return "bg-red-500";
  if (score > 0.4) return "bg-amber-500";
  return "bg-emerald-500";
};

/* ─── Main Component ────────────────────────────────────────────── */
export function DiagnosisForm() {
  const dispatch = useAppDispatch();
  const diagnosisData = useAppSelector((state) => state.diagnosis);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Patient Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVisits, setPatientVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [showHistory, setShowHistory] = useState(false); 

  // Infinite Scroll & Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle clicking outside to close Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lastPatientElementRef = useCallback((node: HTMLButtonElement | null) => {
    if (isSearching) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { rootMargin: '100px' });
    if (node) observerRef.current.observe(node);
  }, [isSearching, hasMore]);

  // Fetch Patients
  const fetchPatients = useCallback(async (currentPage: number, qs: string, append = false) => {
    try {
      if (currentPage === 1) setIsSearching(true);
      const data = await PatientService.getPatients(currentPage, 10, { search: qs });
      const newItems = data.data || [];
      setPatients(prev => append ? [...prev, ...newItems] : newItems);
      setHasMore(currentPage < (data.totalPages || 1) && newItems.length > 0);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      if (!append) setPatients([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce Search Logic
  useEffect(() => {
    if (!isDropdownOpen) return;

    // Only debounce if there's actual typing
    const delay = searchQuery ? 800 : 0;

    const timer = setTimeout(() => {
      setPage(1);
      fetchPatients(1, searchQuery, false);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, isDropdownOpen, fetchPatients]);

  // Pagination Logic (Infinite Scroll)
  useEffect(() => {
    if (!isDropdownOpen || page <= 1) return;
    fetchPatients(page, searchQuery, true);
  }, [page, isDropdownOpen, searchQuery, fetchPatients]);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const symptoms = await AiService.getSymptoms();
        setAvailableSymptoms(symptoms);
      } catch {
        toast.error("Không thể tải danh sách triệu chứng từ AI");
      }
    };
    fetchSymptoms();
  }, []);

  // Fetch Patient Visits on Selection
  useEffect(() => {
    if (selectedPatient) {
      const fetchVisits = async () => {
        try {
          setIsLoadingVisits(true);
          const visits = await VisitService.getPatientVisits(selectedPatient.id);
          setPatientVisits(visits);
        } catch (error) {
          console.error("Failed to fetch visits:", error);
          // toast.error("Không thể tải lịch sử khám");
        } finally {
          setIsLoadingVisits(false);
        }
      };
      fetchVisits();
    } else {
      setPatientVisits([]);
      setShowHistory(false);
    }
  }, [selectedPatient]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      dispatch(setImagePreview(URL.createObjectURL(file)));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".dcm"] },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng tải lên ảnh X-quang để phân tích");
      return;
    }
    try {
      setIsSubmitting(true);
      const result = await AiService.predictMultimodal(selectedFile, selectedSymptoms.join(","));
      dispatch(setMultimodalResult(result));
      toast.success("Phân tích đa phương thức thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi phân tích đa phương thức");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    dispatch(setImagePreview(undefined));
    dispatch(setPredictionResult(null));
  };

  const toggleSymptom = (symptom: string, checked: boolean) => {
    setSelectedSymptoms(prev =>
      checked ? [...prev, symptom] : prev.filter(s => s !== symptom)
    );
  };

  const handleSaveVisit = async () => {
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân trước khi lưu");
      return;
    }

    if (!diagnosisData.multimodalResult) {
      toast.error("Vui lòng thực hiện chẩn đoán trước khi lưu");
      return;
    }

    try {
      setIsSaving(true)
      await VisitService.createMultimodalVisit({
        patientId: selectedPatient.id,
        symptoms: selectedSymptoms.map(s => SYMPTOM_LABELS[s] || s).join(", "),
        note: note,
        imageUrl: diagnosisData.multimodalResult.heatmap || "",
        imageType: "XRAY",
        result: diagnosisData.multimodalResult.risk_level === "HIGH" ? "PNEUMONIA" : "NORMAL",
        confidenceScore: diagnosisData.multimodalResult.final_score,
        modelVersion: "v1.0"
      });

      toast.success("Đã lưu kết quả chẩn đoán vào hồ sơ bệnh nhân!");
      setNote(""); // Clear note after success
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Lỗi khi lưu kết quả chẩn đoán";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const riskInfo = RISKS_MAP[diagnosisData.multimodalResult?.risk_level ?? "Unknown"] ?? RISKS_MAP.Unknown;
  const canSubmit = !!selectedFile && !isSubmitting;

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-500">
      {/* ── Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Chẩn đoán đa phương thức"
        subtitle="Kết hợp hình ảnh X-quang và triệu chứng lâm sàng để phân tích chính xác hơn"
        icon={BrainCircuit}
      />

      {/* ── Patient Selection Section ──────────────────────────────── */}
      <div className="bg-card rounded-[20px] shadow-sm border border-border/50 p-5 sm:px-8 sm:py-6 relative z-20 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-foreground">Hồ sơ bệnh nhân</h2>
              <p className="text-[12px] font-medium text-muted-foreground">Chọn bệnh nhân để lưu kết quả chẩn đoán</p>
            </div>
          </div>

          <div className="w-full sm:w-[350px] relative" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo Tên, SĐT, Mã BN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              onFocus={() => {
                setIsDropdownOpen(true);
                setPage(1);
              }}
              className="pl-9 h-11 rounded-xl bg-muted/40 border-border/40 focus:bg-card transition-all font-medium text-[13px]"
            />
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40 border-b border-border/30 flex items-center justify-between">
                  <span>Danh sách bệnh nhân</span>
                  <button onClick={() => setIsDropdownOpen(false)}><X className="h-4 w-4 hover:text-slate-700" /></button>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {patients.map((patient, index) => {
                    const isLast = index === patients.length - 1;
                    return (
                      <button
                        key={patient.id}
                        ref={isLast ? lastPatientElementRef : null}
                        onClick={() => { setSelectedPatient(patient); setIsDropdownOpen(false); setSearchQuery(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-muted/40 flex items-center justify-between group transition-colors border-b border-border/20 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center text-[12px] font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                            {patient.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-foreground">{patient.fullName}</p>
                            <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 flex gap-2">
                              <span>SĐT: {patient.phone || "Trống"}</span>
                              <span>•</span>
                              <span>{patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}</span>
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-card text-muted-foreground whitespace-nowrap ml-2"><Hash className="w-3 h-3 mr-1" /> {patient.code}</Badge>
                      </button>
                    );
                  })}

                  {isSearching && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}

                  {!isSearching && patients.length === 0 && (
                    <div className="p-4 text-center text-[13px] text-muted-foreground font-semibold">Không tìm thấy bệnh nhân nào.</div>
                  )}
 
                  {!isSearching && patients.length > 0 && !hasMore && (
                    <div className="p-3 text-center text-[11px] text-muted-foreground/60 font-black uppercase tracking-wider">Đã tải toàn bộ dữ liệu</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedPatient && (
          <>
            <div className="mt-5 pt-5 border-t border-border/30 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 gap-1 rounded-full px-3 py-1 text-[12px]">
                  <Check className="w-3.5 h-3.5" />
                  Đã chọn: <strong className="font-black ml-1 text-foreground">{selectedPatient.fullName}</strong>
                </Badge>
                <Badge variant="outline" className="border-border/40 text-muted-foreground rounded-full px-3 py-1 text-[11px] font-semibold bg-card">
                  {selectedPatient.code}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1.5 text-[12px] font-black text-primary hover:opacity-80 transition-all"
                >
                  <History className="h-4 w-4" />
                  {showHistory ? "Thoát lịch sử" : `Xem lịch sử (${patientVisits.length})`}
                </button>
                <button onClick={() => setSelectedPatient(null)} className="text-[12px] font-bold text-muted-foreground hover:text-destructive transition-colors">Hủy chọn</button>
              </div>
            </div>

            {showHistory && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <h3 className="text-[12px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  Lịch sử khám bệnh
                </h3>
                
                {isLoadingVisits ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                  </div>
                ) : patientVisits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patientVisits.map((visit) => (
                      <div key={visit.id} className="bg-muted/30 border border-border/30 rounded-2xl p-4 space-y-3 hover:border-primary/40 transition-all cursor-default group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-bold uppercase">
                              {format(new Date(visit.visitDate), "dd MMM yyyy", { locale: vi })}
                            </span>
                          </div>
                          {visit.diagnoses && visit.diagnoses.length > 0 && (
                            <Badge className={`${visit.diagnoses[0].result === "PNEUMONIA" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"} text-[10px] uppercase font-black`}>
                              {visit.diagnoses[0].result}
                            </Badge>
                          )}
                        </div>

                        <div className="aspect-[4/3] rounded-xl overflow-hidden relative bg-muted/40 border border-border/30">
                          {visit.medicalImages && visit.medicalImages.length > 0 ? (
                            <Image
                              src={visit.medicalImages[0].imageUrl} 
                              alt="X-Ray" 
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
                              <ImageIcon className="h-8 w-8 opacity-20" />
                              <span className="text-[10px] font-bold">KHÔNG CÓ ẢNH</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Triệu chứng & Chẩn đoán</p>
                          <p className="text-[12px] font-semibold text-foreground/80 line-clamp-2 leading-relaxed">
                            {visit.symptoms || "Không ghi chú triệu chứng"}
                          </p>
                          {visit.diagnoses && visit.diagnoses.length > 0 && (
                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-muted-foreground/70 uppercase">Độ tin cậy AI</span>
                              <span className="text-[11px] font-black text-foreground">
                                {(visit.diagnoses[0].confidenceScore * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 bg-muted/20 rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center gap-2">
                    <History className="h-6 w-6 text-muted-foreground/30" />
                    <p className="text-[12px] font-semibold text-muted-foreground/50">Chưa có lịch sử khám bệnh trước đây</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Input Section ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
        {/* Left: Image Upload */}
        <div className="bg-card rounded-[20px] shadow-sm border border-border/50 flex flex-col overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileImage className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-foreground leading-tight">Chẩn đoán hình ảnh</h2>
              <p className="text-[12px] font-medium text-muted-foreground">Tải lên ảnh X-quang phổi để AI phân tích</p>
            </div>
          </div>

          {/* Dropzone */}
          <div className="p-5 flex-1 flex flex-col">
            <div
              {...getRootProps()}
              className={`
                relative flex-1 min-h-[280px] rounded-2xl border-2 border-dashed cursor-pointer
                flex flex-col items-center justify-center transition-all duration-200 group
                ${isDragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : diagnosisData.imagePreview
                    ? "border-transparent bg-transparent p-0"
                    : "border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                }
              `}
            >
              <input {...getInputProps()} />

              {diagnosisData.imagePreview ? (
                /* Image Preview */
                <div className="relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden border border-border/30 bg-slate-950">
                  <Image
                    src={diagnosisData.imagePreview}
                    alt="X-quang Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {/* Overlay controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={clearImage}
                      className="flex items-center gap-1.5 bg-red-500 text-white text-[12px] font-bold px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Xóa ảnh
                    </button>
                    <span className="text-white text-[11px] font-semibold bg-black/50 px-3 py-1.5 rounded-full">
                      Click để thay thế
                    </span>
                  </div>
                  {/* File name badge */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full max-w-[80%] truncate">
                    {selectedFile?.name}
                  </div>
                  {/* Check badge */}
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-200 ${isDragActive ? "bg-primary/20 scale-110" : "bg-primary/10"}`}>
                    <Upload className={`h-9 w-9 transition-colors ${isDragActive ? "text-primary" : "text-primary/70"}`} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[15px] font-bold text-foreground">
                      {isDragActive ? "Thả file vào đây!" : "Tải lên ảnh X-quang"}
                    </p>
                    <p className="text-[12px] font-medium text-muted-foreground max-w-[200px] leading-relaxed">
                      Kéo thả hoặc <span className="text-primary font-bold underline underline-offset-2">click để chọn</span> file<br />(JPG, PNG, DICOM)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-2">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Hỗ trợ: JPG, PNG, DICOM • Tối đa 10MB
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Symptoms + Submit */}
        <div className="bg-card rounded-[20px] shadow-sm border border-border/50 flex flex-col overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-[14px] font-black text-foreground leading-tight">Triệu chứng & Lâm sàng</h2>
                <p className="text-[12px] font-medium text-muted-foreground">Chọn các triệu chứng bệnh nhân</p>
              </div>
            </div>
            {selectedSymptoms.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full">
                <Check className="h-3 w-3" /> {selectedSymptoms.length} triệu chứng
              </span>
            )}
          </div>

          {/* Symptoms Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
              Tích chọn triệu chứng hiện tại
            </Label>

            {availableSymptoms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableSymptoms.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <label
                      key={symptom}
                      htmlFor={`symptom-${symptom}`}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
                        ${isChecked
                          ? "border-primary/40 bg-primary/10"
                          : "border-border/40 bg-muted/20 hover:border-border hover:bg-muted/40"
                        }
                      `}
                    >
                      <Checkbox
                        id={`symptom-${symptom}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => toggleSymptom(symptom, !!checked)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                      />
                      <span className={`text-[13px] font-semibold ${isChecked ? "text-primary" : "text-foreground/80"}`}>
                        {SYMPTOM_LABELS[symptom] || symptom}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-[13px] font-semibold">Đang tải triệu chứng từ AI...</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Central Submit Button ───────────────────────────────── */}
      <div className="flex flex-col items-center justify-center pt-2 pb-6">
        {!selectedFile && (
          <p className="text-[12px] font-semibold text-amber-600 flex items-center gap-1.5 mb-3 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5" /> Vui lòng tải ảnh X-quang trước khi phân tích
          </p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`h-14 px-12 rounded-full gap-3 text-[16px] font-black shadow-xl transition-all duration-300 ${!canSubmit ? 'opacity-40 cursor-not-allowed scale-100' : 'hover:scale-105 active:scale-95 shadow-primary/30'}`}
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, hsl(var(--primary)) 0%, #4f46e5 100%)"
              : undefined,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Đang phân tích AI...
            </>
          ) : (
            <>
              <Zap className="h-6 w-6 fill-white" />
              Tiến Hành Chẩn Đoán AI
            </>
          )}
        </Button>
      </div>

      {/* ── Results Section ──────────────────────────────────────── */}
      {diagnosisData.multimodalResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
          {/* Result Header Banner */}
          <div className={`rounded-[20px] border px-6 py-5 flex items-center justify-between ${riskInfo.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${riskInfo.dot} animate-pulse`} />
              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Kết quả chẩn đoán AI</p>
                <h3 className={`text-[22px] font-black tracking-tight ${riskInfo.color}`}>{riskInfo.label}</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Điểm tổng hợp</p>
                <p className={`text-[26px] font-black ${riskInfo.color}`}>
                  {(diagnosisData.multimodalResult.final_score * 100).toFixed(0)}%
                </p>
              </div>
              <BrainCircuit className={`h-10 w-10 ${riskInfo.color} opacity-60`} />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Heatmap */}
            <div className="bg-card rounded-[20px] shadow-sm border border-border/50 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <FileImage className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-foreground">Heatmap Grad-CAM</h3>
                  <p className="text-[12px] font-medium text-muted-foreground">Vùng AI nhận diện tổn thương</p>
                </div>
              </div>
              <div className="p-5">
                <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-slate-950 border border-border/20">
                  {(diagnosisData.multimodalResult.heatmap || diagnosisData.imagePreview) ? (
                    <>
                      <Image
                        src={
                          diagnosisData.multimodalResult.heatmap
                            ? diagnosisData.multimodalResult.heatmap.startsWith("data:")
                              ? diagnosisData.multimodalResult.heatmap
                              : `data:image/jpeg;base64,${diagnosisData.multimodalResult.heatmap}`
                            : (diagnosisData.imagePreview || "")
                        }
                        alt="AI Heatmap"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                      {diagnosisData.multimodalResult.heatmap && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          🔴 Vùng tổn thương
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                      <FileImage className="h-10 w-10 opacity-30" />
                      <p className="text-[12px] font-semibold">Không có dữ liệu hình ảnh</p>
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground text-center italic mt-3">
                  Vùng màu đỏ/vàng là khu vực AI xác định có xác suất tổn thương cao
                </p>
              </div>
            </div>

            {/* Right: Scores + Clinical Notes */}
            <div className="space-y-4">
              {/* Score Bars */}
              <div className="bg-card rounded-[20px] shadow-sm border border-border/50 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-[14px] font-black text-foreground">Phân bổ xác suất</h3>
                </div>
                <div className="p-5 space-y-5">
                  {([
                    { label: "Hình ảnh (Vision AI)", value: diagnosisData.multimodalResult.vision_probability },
                    { label: "Lâm sàng (Clinical AI)", value: diagnosisData.multimodalResult.clinical_probability },
                    { label: "Tổng hợp (Multimodal)", value: diagnosisData.multimodalResult.final_score, highlight: true },
                  ] as { label: string; value: number; highlight?: boolean }[]).map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[13px] font-${item.highlight ? "black" : "semibold"} ${item.highlight ? "text-primary" : "text-foreground/80"}`}>
                          {item.label}
                        </span>
                        <span className={`text-[14px] font-black ${item.highlight ? "text-primary" : "text-foreground"}`}>
                          {(item.value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full overflow-hidden shadow-inner ${item.highlight ? "h-3 bg-muted/80" : "h-2 bg-muted/60"}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(item.value)}`}
                          style={{ width: `${item.value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical assessment */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <h4 className="text-[13px] font-black text-primary/90">Nhận định lâm sàng</h4>
                </div>
                <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">
                  Dựa trên phân tích kết hợp X-quang và{" "}
                  <strong className="text-primary">{selectedSymptoms.length}</strong> triệu chứng, mức độ rủi ro viêm phổi được đánh giá là{" "}
                  <strong className="uppercase text-primary">{riskInfo.label}</strong>.
                </p>
                {selectedSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSymptoms.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-full border border-primary/10">
                        <Check className="h-2.5 w-2.5" /> {SYMPTOM_LABELS[s] || s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-500/90 leading-relaxed font-semibold italic">
                  Kết quả này chỉ mang tính tham khảo từ AI. Bác sĩ cần đối chiếu với lâm sàng thực tế và các xét nghiệm bổ sung trước khi kết luận.
                </p>
              </div>

              {/* Save Results Action */}
              <div className="bg-card rounded-[20px] shadow-sm border border-border/50 p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-black text-foreground">Ghi chú của bác sĩ</Label>
                  <Textarea
                    placeholder="Ghi chú thêm về tình trạng bệnh nhân hoặc chỉ dẫn điều trị..."
                    className="min-h-[100px] rounded-xl bg-muted/20 border-border/40 focus:bg-card resize-none text-[13px]"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {!selectedPatient && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-[11px] font-bold text-destructive">Bạn chưa chọn bệnh nhân để lưu hồ sơ</p>
                  </div>
                )}

                <Button
                  onClick={handleSaveVisit}
                  disabled={isSaving || !selectedPatient}
                  className="w-full h-12 rounded-xl gap-2 font-black text-[14px] shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang lưu hồ sơ...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Lưu Kết Quả Vào Hồ Sơ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
