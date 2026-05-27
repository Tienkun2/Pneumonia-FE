"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createVisitThunk } from "@/store/slices/visit-slice";
import { fetchPatients } from "@/store/slices/patient-slice";
import { PatientService } from "@/services/patient-service";
import { Patient } from "@/types/patient";
import { SYMPTOM_LABELS } from "@/constants/diagnosis";
import { PatientFormDialog } from "@/features/patients/action-form/patient-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Search, UserPlus, FileText, Stethoscope, Activity, Check, Loader2, 
  X, Info, Calendar, MapPin, Phone, User, CheckCircle2, ChevronRight, HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MODAL_STYLES, FORM_STYLES, getBadgeClass } from "@/constants/styles";

const SYMPTOM_ITEMS = [
  { key: "cough", label: "Ho" },
  { key: "high_fever", label: "Sốt cao" },
  { key: "breathlessness", label: "Khó thở" },
  { key: "chest_pain", label: "Đau ngực" },
  { key: "fatigue", label: "Mệt mỏi" },
  { key: "phlegm", label: "Đờm" },
  { key: "chills", label: "Rét run" },
  { key: "fast_heart_rate", label: "Nhịp tim nhanh" },
  { key: "rusty_sputum", label: "Đờm màu gỉ sắt" },
  { key: "malaise", label: "Uể oải" },
];

export function NewRegistration() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxPatients = useAppSelector((state) => state.patient.patients);

  // Form States
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState("");
  const [note, setNote] = useState("");
  
  // Search Autocomplete States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dialog States
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [expectingNewPatient, setExpectingNewPatient] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Debounce logic
  useEffect(() => {
    if (!isDropdownOpen) return;
    const delay = searchQuery ? 400 : 0;
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await PatientService.getPatients(1, 8, { search: searchQuery });
        setSearchResults(data.data || []);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [searchQuery, isDropdownOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to Redux patients list to auto-select the newly created patient
  useEffect(() => {
    if (expectingNewPatient && reduxPatients.length > 0) {
      const newPatient = reduxPatients[0];
      setSelectedPatient(newPatient);
      setExpectingNewPatient(false);
      toast.success(`Đã tự động chọn bệnh nhân vừa tạo: ${newPatient.fullName}`);
    }
  }, [reduxPatients, expectingNewPatient]);

  const handlePatientFormSuccess = async () => {
    // Refresh patient list in Redux to ensure the newest one is at index 0
    await dispatch(fetchPatients({ page: 1, size: 10 }));
    setExpectingNewPatient(true);
  };

  const handleToggleSymptom = (key: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleResetForm = () => {
    setSelectedPatient(null);
    setSelectedSymptoms([]);
    setCustomSymptoms("");
    setNote("");
    setSearchQuery("");
  };

  const handleRegister = async () => {
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân");
      return;
    }

    // Combine symptom list
    const mappedSymptoms = selectedSymptoms.map((key) => SYMPTOM_LABELS[key] || key);
    if (customSymptoms.trim()) {
      mappedSymptoms.push(customSymptoms.trim());
    }

    const symptomsString = mappedSymptoms.join(", ");

    if (!symptomsString) {
      toast.error("Vui lòng chọn hoặc nhập ít nhất một triệu chứng lâm sàng");
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        createVisitThunk({
          patientId: selectedPatient.id,
          symptoms: symptomsString,
          note: note.trim() || undefined,
        })
      ).unwrap();

      toast.success("Đăng ký ca bệnh mới thành công!");
      setShowSuccessDialog(true);
    } catch (error: unknown) {
      const errorMessage = typeof error === "string" ? error : "Lỗi khi đăng ký ca bệnh";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full animate-in fade-in duration-500">
      {/* ── Page Header ────────────────────────────── */}
      <PageHeader
        title="Đăng ký ca bệnh mới"
        subtitle="Tiếp nhận bệnh nhân, ghi nhận triệu chứng ban đầu và tạo lượt khám mới"
        icon={Stethoscope}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Columns (Patient and Symptoms) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Patient Selection */}
          <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md overflow-visible relative z-30">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Thông tin bệnh nhân
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Chọn bệnh nhân đã có hoặc tạo hồ sơ bệnh nhân mới
                  </CardDescription>
                </div>
                {!selectedPatient && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPatientDialog(true)}
                    className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Thêm bệnh nhân mới
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!selectedPatient ? (
                <div className="relative w-full" ref={dropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      placeholder="Tìm kiếm bệnh nhân theo mã, họ tên hoặc số điện thoại..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="pl-10 h-11 border-border/60 rounded-xl bg-card/50 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/40 text-sm font-medium placeholder:text-muted-foreground/40 w-full shadow-sm"
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-popover border border-border shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="p-2 border-b border-border/40 bg-muted/40 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2">
                          Kết quả tìm kiếm bệnh nhân
                        </p>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {searchResults.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsDropdownOpen(false);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center justify-between border-b border-border/40 last:border-0"
                          >
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-foreground">{patient.fullName}</p>
                              <p className="text-xs font-medium text-muted-foreground/80">
                                Mã: <span className="font-semibold uppercase">{patient.code}</span>
                                {patient.phone && ` • SĐT: ${patient.phone}`}
                              </p>
                            </div>
                            <Badge variant="outline" className={getBadgeClass(patient.gender === "MALE" ? "default" : "info", "h-5 text-[9px] font-bold")}>
                              {patient.gender === "MALE" ? "NAM" : patient.gender === "FEMALE" ? "NỮ" : "KHÁC"}
                            </Badge>
                          </button>
                        ))}
                        {isSearching && (
                          <div className="p-4 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                          </div>
                        )}
                        {searchResults.length === 0 && !isSearching && (
                          <div className="p-6 text-center text-sm text-muted-foreground font-medium italic">
                            {searchQuery ? "Không tìm thấy bệnh nhân trùng khớp" : "Nhập từ khóa để tìm kiếm bệnh nhân..."}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 border border-primary/20 rounded-2xl p-5 shadow-inner animate-in fade-in zoom-in-95 duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPatient(null)}
                    className="absolute top-4 right-4 h-7 w-7 rounded-full bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Chọn bệnh nhân khác"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>

                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-black shrink-0">
                      {selectedPatient.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1.5 flex-1 leading-tight">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-foreground">{selectedPatient.fullName}</h3>
                        <Badge className="bg-primary text-primary-foreground font-bold tracking-wider text-[10px] h-5 rounded-md px-1.5 uppercase">
                          {selectedPatient.code}
                        </Badge>
                        <Badge variant="outline" className={getBadgeClass(selectedPatient.gender === "MALE" ? "default" : "info", "h-5 text-[9px] font-bold")}>
                          {selectedPatient.gender === "MALE" ? "Nam" : selectedPatient.gender === "FEMALE" ? "Nữ" : "Khác"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground font-medium pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>Ngày sinh: {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa có"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>Điện thoại: {selectedPatient.phone || "Chưa có"}</span>
                        </div>
                        {selectedPatient.guardianName && (
                          <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                            <span>Người giám hộ: {selectedPatient.guardianName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span className="line-clamp-1">Địa chỉ: {selectedPatient.address || "Chưa có"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Symptoms selection */}
          <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-500" /> Triệu chứng lâm sàng
              </CardTitle>
              <CardDescription className="text-xs">
                Chọn nhanh các triệu chứng hô hấp quan sát thấy hoặc do bệnh nhân khai báo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Checkable pills grid */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chọn nhanh triệu chứng phổ biến
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {SYMPTOM_ITEMS.map((item) => {
                    const isSelected = selectedSymptoms.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleToggleSymptom(item.key)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 duration-200",
                          isSelected
                            ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-500/30 font-bold shadow-sm"
                            : "bg-background/80 border-border/80 text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom symptom input */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Triệu chứng khác / Mô tả thêm
                </span>
                <Input
                  placeholder="Ví dụ: Đau đầu, tiêu chảy nhẹ, nôn trớ sau ăn, khóc quấy nhiều..."
                  value={customSymptoms}
                  onChange={(e) => setCustomSymptoms(e.target.value)}
                  className="h-10 border-border/60 bg-card/40 text-sm font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column (Notes and Actions) ── */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" /> Ghi chú và tiếp nhận
                </CardTitle>
                <CardDescription className="text-xs">
                  Nhập ghi chú lâm sàng ban đầu hoặc tiền sử bệnh lý (nếu có)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Ghi chú lâm sàng
                  </span>
                  <Textarea
                    placeholder="Nhập tiền sử bệnh lý dị ứng, nhiệt độ đo được tại phòng khám, nhịp thở ban đầu hoặc các ghi chú khác từ điều dưỡng..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[120px] resize-none border-border/60 bg-card/40 text-sm font-medium leading-relaxed"
                  />
                </div>

                <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 flex gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Thông tin ca bệnh sẽ được tạo lập tức trên hệ thống và hiển thị trong danh sách lượt khám của bệnh nhân. Bác sĩ có thể thực hiện chẩn đoán AI bằng hình ảnh X-quang sau khi ca bệnh này được đăng ký.
                  </p>
                </div>
              </CardContent>
            </div>

            <CardContent className="p-6 pt-0 border-t border-border/40 mt-auto bg-muted/10 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleResetForm}
                disabled={isSubmitting}
                className="flex-1 h-11 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-muted"
              >
                Đặt lại
              </Button>
              <Button
                onClick={handleRegister}
                disabled={isSubmitting || !selectedPatient}
                className="flex-1 h-11 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Stethoscope className="h-4 w-4" />
                )}
                Đăng ký ca bệnh
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Modal 1: Add Patient Dialog ────────────────────────────── */}
      <PatientFormDialog
        open={showAddPatientDialog}
        onOpenChange={setShowAddPatientDialog}
        onSuccess={handlePatientFormSuccess}
      />

      {/* ── Modal 2: Success Routing Dialog ─────────────────────────── */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-teal-600 p-8 text-center text-primary-foreground relative">
            <div className="mx-auto w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-wider text-white">
              Đăng ký ca bệnh thành công
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs font-medium mt-1">
              Ca bệnh/Lượt khám của bệnh nhân <strong className="text-white underline">{selectedPatient?.fullName}</strong> đã được lưu vào cơ sở dữ liệu.
            </DialogDescription>
          </div>

          <div className="p-6 bg-card space-y-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-2">
              Bạn muốn thực hiện hành động gì tiếp theo?
            </p>

            <div className="flex flex-col gap-3">
              {/* Option 1: AI Diagnosis */}
              <button
                onClick={() => {
                  setShowSuccessDialog(false);
                  const pId = selectedPatient?.id;
                  handleResetForm();
                  router.push(`/medical/ai-diagnosis/analysis?patientId=${pId}`);
                }}
                className="w-full p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left flex items-center justify-between group active:scale-[0.99] duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                      Chẩn đoán AI ngay lập tức
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      Chuyển sang trang chẩn đoán và tải ảnh X-quang
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-200" />
              </button>

              {/* Option 2: Register another */}
              <button
                onClick={() => {
                  setShowSuccessDialog(false);
                  handleResetForm();
                }}
                className="w-full p-4 rounded-xl border border-border/60 hover:bg-muted/50 transition-all text-left flex items-center justify-between group active:scale-[0.99] duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Tiếp tục đăng ký ca mới
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      Xóa sạch form và nhập thông tin bệnh nhân tiếp theo
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors group-hover:translate-x-1 duration-200" />
              </button>

              {/* Option 3: Go to list */}
              <button
                onClick={() => {
                  setShowSuccessDialog(false);
                  handleResetForm();
                  router.push("/medical/patient-mgmt/patient-list");
                }}
                className="w-full p-4 rounded-xl border border-border/60 hover:bg-muted/50 transition-all text-left flex items-center justify-between group active:scale-[0.99] duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Xem danh sách bệnh nhân
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      Quay lại trang quản lý hồ sơ và lịch sử khám
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors group-hover:translate-x-1 duration-200" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
