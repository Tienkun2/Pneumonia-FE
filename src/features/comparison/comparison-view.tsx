"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPatients } from "@/store/slices/patientSlice";
import { fetchPatientVisits } from "@/store/slices/visitSlice";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeftRight,
  Search,
  Calendar,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Info,
  Check,
  ChevronsUpDown,
  Loader2,
  Zap,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { RiskGauge } from "@/components/medical/risk-gauge";
import { formatDate, cn } from "@/lib/utils";
import { Visit } from "@/types/visit";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PageHeader } from "@/components/layout/page-header";

/* ─── Real data calculation ────────────────────────────────── */
const getVisitRisk = (visit: Visit | undefined) => {
  const diag = visit?.diagnoses?.[0];
  if (!diag) return 0;
  return diag.confidenceScore * 100;
};

const getRiskLabel = (risk: number) => risk > 70 ? "Cao" : risk > 40 ? "Trung bình" : "Thấp";
const getRiskColor = (risk: number) => risk > 70 ? "text-red-600" : risk > 40 ? "text-amber-600" : "text-emerald-600";
const getRiskBg = (risk: number) => risk > 70 ? "bg-red-500/10 border-red-500/20" : risk > 40 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20";

/* ─── Component ─────────────────────────────────────────────── */
export function ComparisonView() {
  const dispatch = useAppDispatch();
  const patients = useAppSelector((state) => state.patient.patients);
  const { visits, isLoading: isVisitsLoading } = useAppSelector((state) => state.visit);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [visitAId, setVisitAId] = useState<string>("");
  const [visitBId, setVisitBId] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageRef = useRef(page);
  const { totalPages, isLoading: isPatientsLoading } = useAppSelector((state) => state.patient);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    dispatch(fetchPatients({ page, size: 10, filters: { search: debouncedSearch } }));
  }, [dispatch, page, debouncedSearch]);
  useEffect(() => {
    if (selectedPatientId) {
      dispatch(fetchPatientVisits(selectedPatientId));
      setVisitAId(""); setVisitBId(""); setIsComparing(false);
    }
  }, [selectedPatientId, dispatch]);

  const visitA = useMemo(() => visits.find((v) => v.id === visitAId), [visits, visitAId]);
  const visitB = useMemo(() => visits.find((v) => v.id === visitBId), [visits, visitBId]);

  // Determine chronological order to label cards correctly
  const sortedVisits = useMemo(() => {
    if (!visitA || !visitB) return { first: visitA, second: visitB };
    const dateA = new Date(visitA.visitDate).getTime();
    const dateB = new Date(visitB.visitDate).getTime();
    return dateA <= dateB ? { first: visitA, second: visitB } : { first: visitB, second: visitA };
  }, [visitA, visitB]);

  const riskFirst = getVisitRisk(sortedVisits.first);
  const riskSecond = getVisitRisk(sortedVisits.second);
  const delta = riskSecond - riskFirst;
  const improving = delta <= 0;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (isPatientsLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pageRef.current < totalPages) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [isPatientsLoading, totalPages]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const canCompare = !!visitAId && !!visitBId;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Header ──────────────────────────────────────── */}
      <PageHeader
        title="So sánh tiến triển"
        subtitle="Đối chiếu hai lượt khám để theo dõi diễn biến và hiệu quả điều trị"
        icon={ArrowLeftRight}
      />

      {/* ── Selection Panel ─────────────────────────────── */}
      <div className="bg-card rounded-[20px] shadow-sm border border-border/50 p-6">
        <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-4">
          Cấu hình so sánh
        </p>
        <div className="grid gap-4 md:grid-cols-4 items-end">
          {/* Patient combobox */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Bệnh nhân
            </label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-10 bg-card rounded-xl border-border/50 shadow-sm font-medium text-[13px] hover:bg-muted/30"
                >
                  <span className="truncate text-foreground">
                    {selectedPatient?.fullName ?? "Tìm kiếm bệnh nhân..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-xl" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Nhập tên hoặc mã..." value={search} onValueChange={setSearch} />
                  <CommandList className="max-h-[260px] overflow-y-auto">
                    {patients.length === 0 && !isPatientsLoading && (
                      <CommandEmpty>Không tìm thấy bệnh nhân.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {patients.map((patient, index) => (
                        <CommandItem
                          key={`${patient.id}-${index}`}
                          value={patient.fullName}
                          onSelect={() => { setSelectedPatientId(patient.id); setComboboxOpen(false); }}
                          className="cursor-pointer py-3 rounded-xl"
                        >
                          <Check className={cn("mr-2 h-4 w-4 text-primary", selectedPatientId === patient.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold">{patient.fullName}</span>
                            <span className="text-[11px] text-muted-foreground">{patient.code}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {!isPatientsLoading && page < totalPages && <div ref={lastItemRef} className="h-4" />}
                    {isPatientsLoading && (
                      <div className="flex items-center justify-center gap-2 py-3 text-[12px] text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Visit A */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Lượt khám Cơ sở
            </label>
            <Select value={visitAId} onValueChange={setVisitAId} disabled={!selectedPatientId || isVisitsLoading}>
              <SelectTrigger className="h-10 rounded-xl border-border/50 bg-card shadow-sm text-[13px] font-medium">
                <SelectValue placeholder={isVisitsLoading ? "Đang tải..." : "Chọn ngày khám..."} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {visits.map(v => (
                  <SelectItem key={v.id} value={v.id} className="text-[13px]">
                    {formatDate(v.visitDate, "HH:mm:ss DD/MM/YYYY")} — {v.createdBy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visit B */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Lượt khám Đối chiếu
            </label>
            <Select value={visitBId} onValueChange={setVisitBId} disabled={!selectedPatientId || isVisitsLoading}>
              <SelectTrigger className="h-10 rounded-xl border-border/50 bg-card shadow-sm text-[13px] font-medium">
                <SelectValue placeholder={isVisitsLoading ? "Đang tải..." : "Chọn ngày khám..."} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {visits.filter(v => v.id !== visitAId).map(v => (
                  <SelectItem key={v.id} value={v.id} className="text-[13px]">
                    {formatDate(v.visitDate, "HH:mm:ss DD/MM/YYYY")} — {v.createdBy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <Button
            onClick={() => setIsComparing(true)}
            disabled={!canCompare}
            className="h-10 rounded-xl gap-2 text-[13px] font-bold shadow-md shadow-primary/20 disabled:opacity-40"
          >
            <Zap className="h-4 w-4" /> Phân tích <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Empty State ─────────────────────────────────── */}
      {!selectedPatientId && !isComparing && (
        <div className="bg-card rounded-[20px] shadow-sm border border-border/50 py-20 flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center">
            <ArrowLeftRight className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <h3 className="text-[16px] font-bold text-foreground">Bắt đầu so sánh tiến triển</h3>
            <p className="text-[13px] font-medium text-muted-foreground mt-1 max-w-sm">
              Chọn một bệnh nhân ở trên để xem lại hành trình điều trị qua các lần X-Quang.
            </p>
          </div>
        </div>
      )}

      {/* ── Comparison Workspace ─────────────────────────── */}
      {isComparing && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Summary Banner */}
          <div className={`rounded-[20px] border px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 ${improving ? "bg-emerald-500/10 border-emerald-500/20" : "bg-orange-500/10 border-orange-500/20"}`}>
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                {improving
                  ? <TrendingDown className="h-5 w-5 text-emerald-500" />
                  : <TrendingUp className="h-5 w-5 text-orange-500" />
                }
                <h3 className={`text-[17px] font-black ${improving ? "text-emerald-500" : "text-orange-500"}`}>
                  Kết quả phân tích tiến triển
                </h3>
              </div>
              <p className={`text-[13px] font-medium max-w-md leading-relaxed ${improving ? "text-emerald-500/80" : "text-orange-500/80"}`}>
                {improving
                  ? "Hệ thống phát hiện các dấu hiệu phục hồi tích cực. Vùng tổn thương phổi đang có xu hướng thu hẹp."
                  : "Cảnh báo: Có sự gia tăng các chỉ số nguy cơ. Cần xem xét lại phác đồ điều trị hiện tại."}
              </p>
            </div>
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="bg-card rounded-2xl px-6 py-4 border border-border/30 shadow-sm text-center min-w-[140px]">
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">Thay đổi nguy cơ</p>
                <div className={`text-[32px] font-black flex items-center justify-center gap-1 ${improving ? "text-emerald-500" : "text-orange-500"}`}>
                  {improving ? <TrendingDown className="h-7 w-7" /> : <TrendingUp className="h-7 w-7" />}
                  {Math.abs(delta).toFixed(1)}%
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={`justify-center text-[12px] font-bold ${improving ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}`}>
                  {improving ? "✓ Tiến triển tốt" : "⚠ Cần chú ý"}
                </Badge>
                <Button variant="ghost" size="sm" className="text-muted-foreground text-[11px] gap-1 h-7">
                  <Info className="h-3 w-3" /> Chi tiết thuật toán
                </Button>
              </div>
            </div>
          </div>

          {/* Side-by-side X-ray cards */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Visit A: Before */}
            <div className="bg-card rounded-[20px] shadow-sm border border-border/50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
                <div>
                  <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Lần 1 · Cơ sở</p>
                  <h3 className="text-[17px] font-black text-white">Trước điều trị</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">Ngày {formatDate(sortedVisits.first?.visitDate, "HH:mm:ss DD/MM/YYYY")}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full border ${getRiskBg(riskFirst)} ${getRiskColor(riskFirst)}`}>
                  <span className={`w-2 h-2 rounded-full ${riskFirst > 70 ? "bg-red-500" : riskFirst > 40 ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {getRiskLabel(riskFirst)}
                </div>
              </div>
              <div className="p-5 flex-1 space-y-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-950">
                  <Image
                    src={sortedVisits.first?.medicalImages?.[0]?.imageUrl || "https://via.placeholder.com/800x1000?text=No+Image"}
                    width={800} height={1000}
                    className="w-full h-full object-cover"
                    alt="XRay A" unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    X-Ray Cơ sở
                  </div>
                </div>
                <div className="flex items-center justify-center bg-muted/30 rounded-2xl p-5">
                  <RiskGauge riskScore={riskFirst} riskLevel={getRiskLabel(riskFirst)} label="Nguy cơ AI" />
                </div>
              </div>
            </div>

            {/* Visit B: After */}
            <div className="bg-card rounded-[20px] shadow-sm border border-border/50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
                <div>
                  <p className="text-[13px] font-bold text-primary-foreground/60 uppercase tracking-wider">Lần 2 · Đối chiếu</p>
                  <h3 className="text-[17px] font-black text-white">Sau điều trị</h3>
                  <p className="text-[12px] text-primary-foreground/70 mt-0.5">Ngày {formatDate(sortedVisits.second?.visitDate, "HH:mm:ss DD/MM/YYYY")}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full bg-card border border-border shadow-sm ${getRiskColor(riskSecond)}`}>
                  <span className={`w-2 h-2 rounded-full ${riskSecond > 70 ? "bg-red-500" : riskSecond > 40 ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {getRiskLabel(riskSecond)}
                </div>
              </div>
              <div className="p-5 flex-1 space-y-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-950">
                  <Image
                    src={sortedVisits.second?.medicalImages?.[0]?.imageUrl || "https://via.placeholder.com/800x1000?text=No+Image"}
                    width={800} height={1000}
                    className="w-full h-full object-cover"
                    alt="XRay B" unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    X-Ray Đối chiếu
                  </div>
                  {improving && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      ↓ Cải thiện {Math.abs(delta).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center bg-primary/5 rounded-2xl p-5">
                  <RiskGauge riskScore={riskSecond} riskLevel={getRiskLabel(riskSecond)} label="Nguy cơ AI" />
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-500 font-medium leading-relaxed">
              Kết quả phân tích tiến triển dựa trên dữ liệu AI mang tính tham khảo. Bác sĩ cần đánh giá toàn diện lâm sàng trước khi điều chỉnh phác đồ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
