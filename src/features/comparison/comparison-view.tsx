"use client";

import { useState } from "react";
import { useComparison } from "@/hooks/use-comparison";
import { getRiskLabel, getRiskColor, getRiskBg } from "@/constants/diagnosis";
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
  Check,
  ChevronsUpDown,
  AlertTriangle,
  FileText,
  TrendingDown,
  Calendar,
  Zap,
  ChevronRight,
  UserCircle2,
  Trash2,
  Search,
} from "lucide-react";
import Image from "next/image";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { ImageViewer, ImageComparisonSlider } from "@/components/medical";

export function ComparisonView() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | undefined>(undefined);
  const [displayMode, setDisplayMode] = useState<"side-by-side" | "slider">("side-by-side");

  const {
    patients,
    visits,
    isVisitsLoading,
    selectedPatientId,
    setSelectedPatientId,
    comboboxOpen,
    setComboboxOpen,
    visitAId,
    setVisitAId,
    visitBId,
    setVisitBId,
    isComparing,
    setIsComparing,
    showHeatmap,
    setShowHeatmap,
    search,
    setSearch,
    isPatientsLoading,
    selectedPatient,
    canCompare,
    sortedVisits,
    riskFirst,
    riskSecond,
    delta,
    improving,
    lastItemRef,
  } = useComparison();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">So Sánh Tiến Triển</h1>
            <p className="text-xs font-bold text-muted-foreground opacity-70">Đối chiếu hình ảnh và biến thiên chỉ số AI</p>
          </div>
        </div>
        
        {isComparing && (
          <Button variant="ghost" size="sm" onClick={() => setIsComparing(false)} className="text-muted-foreground hover:text-red-500 h-9 font-bold">
            <Trash2 className="h-4 w-4 mr-2" /> Hủy so sánh
          </Button>
        )}
      </div>

      {/* ── TOOLBAR - Minimalist ─────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Patient Selector */}
          <div className="flex-1 min-w-[200px]">
             <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between h-10 rounded-xl border-border/50 bg-background font-bold text-[13px] px-4">
                    <div className="flex items-center gap-2">
                       <UserCircle2 className="h-4 w-4 text-primary" />
                       <span className="truncate">{selectedPatient?.fullName || "Chọn bệnh nhân..."}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 rounded-xl shadow-2xl border-border" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput placeholder="Nhập tên..." value={search} onValueChange={setSearch} className="h-10 text-xs" />
                    <CommandList>
                      {patients.length === 0 && !isPatientsLoading && <CommandEmpty>Không có bệnh nhân.</CommandEmpty>}
                      <CommandGroup>
                        {patients.map((p) => (
                          <CommandItem key={p.id} onSelect={() => { setSelectedPatientId(p.id); setComboboxOpen(false); }} className="cursor-pointer py-2 px-3 m-1 rounded-lg">
                             <div className="flex flex-col">
                                <span className="text-[12px] font-black">{p.fullName}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{p.code}</span>
                             </div>
                             {selectedPatientId === p.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {/* Using the lastItemRef from our hook for infinite scroll */}
                      {!isPatientsLoading && (
                        <div ref={lastItemRef} className="h-4" />
                      )}
                      {isPatientsLoading && <div className="p-4 text-center text-xs text-muted-foreground italic">Đang tải...</div>}
                    </CommandList>
                  </Command>
                </PopoverContent>
             </Popover>
          </div>

          {/* Visits Selectors */}
          <div className="flex items-center gap-2">
            <Select value={visitAId} onValueChange={setVisitAId} disabled={!selectedPatientId || isVisitsLoading}>
              <SelectTrigger className="h-10 w-[160px] rounded-xl border-border/50 bg-background font-bold text-xs ring-0">
                <SelectValue placeholder="Lượt T0" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                 {visits.map(v => (
                   <SelectItem key={v.id} value={v.id} className="text-xs py-2 rounded-lg">{formatDate(v.visitDate, "DD.MM.YYYY — HH:mm")}</SelectItem>
                 ))}
              </SelectContent>
            </Select>

            <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground/30 rotate-45" />

            <Select value={visitBId} onValueChange={setVisitBId} disabled={!selectedPatientId || isVisitsLoading}>
              <SelectTrigger className="h-10 w-[160px] rounded-xl border-border/50 bg-background font-bold text-xs ring-0">
                <SelectValue placeholder="Lượt T1" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                 {visits.filter(v => v.id !== visitAId).map(v => (
                   <SelectItem key={v.id} value={v.id} className="text-xs py-2 rounded-lg">{formatDate(v.visitDate, "DD.MM.YYYY — HH:mm")}</SelectItem>
                 ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[1px] h-6 bg-border/50 mx-1 hidden md:block" />

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
             {isComparing && (
               <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/40">
                 {[
                   { value: "side-by-side", label: "Song song" },
                   { value: "slider", label: "Thanh trượt" }
                 ].map((mode) => (
                   <button
                     key={mode.value}
                     onClick={() => setDisplayMode(mode.value as "side-by-side" | "slider")}
                     className={cn(
                       "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
                       displayMode === mode.value
                         ? "bg-background text-foreground shadow-sm"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     {mode.label}
                   </button>
                 ))}
               </div>
             )}

             <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest hidden lg:block">Grad-Cam</span>
                <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} className="scale-75" />
             </div>
             <Button onClick={() => setIsComparing(true)} disabled={!canCompare} className="h-10 rounded-xl px-8 font-black text-xs shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
               SO SÁNH NGAY
             </Button>
          </div>
        </div>
      </div>

      {/* ── COMPARISON AREA ─────────────────────────────── */}
      {!isComparing ? (
        <div className="bg-card rounded-2xl border-2 border-dashed border-border/50 py-32 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 text-muted-foreground/20 italic">
              <Zap className="h-10 w-10" />
           </div>
           <h3 className="text-lg font-black text-foreground">Sẵn sàng đối chiếu</h3>
           <p className="text-sm font-bold text-muted-foreground max-w-xs mt-2 italic opacity-60">Chọn bệnh nhân và 2 thời điểm chẩn đoán để bắt đầu phân tích sự thay đổi.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {displayMode === "slider" ? (
            /* Slider Comparison Layout */
            <div className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm flex flex-col p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lượt khám T0</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-sm font-black text-foreground">{formatDate(sortedVisits.first?.visitDate, "DD.MM.YYYY — HH:mm")}</h3>
                    <Badge className={cn("px-2 py-0.5 rounded-md border-none font-black text-[9px] uppercase", getRiskBg(riskFirst), getRiskColor(riskFirst))}>
                      {getRiskLabel(riskFirst)} • {riskFirst.toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">
                  <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest leading-none">Chênh lệch</span>
                  <span className="text-sm font-black text-primary flex items-center gap-1 mt-1 leading-none">
                    {Math.abs(delta).toFixed(1)}% {improving ? "↓ Giảm" : "↑ Tăng"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-primary/70 tracking-widest block text-right">Lượt khám T1</span>
                  <div className="flex items-center justify-end gap-2 mt-0.5">
                    <Badge className={cn("px-2 py-0.5 rounded-md border-none font-black text-[9px] uppercase", getRiskBg(riskSecond), getRiskColor(riskSecond))}>
                      {getRiskLabel(riskSecond)} • {riskSecond.toFixed(0)}%
                    </Badge>
                    <h3 className="text-sm font-black text-foreground">{formatDate(sortedVisits.second?.visitDate, "DD.MM.YYYY — HH:mm")}</h3>
                  </div>
                </div>
              </div>

              <div className="relative w-full aspect-video max-h-[500px] rounded-2xl overflow-hidden border border-border/10 shadow-inner bg-black">
                <ImageComparisonSlider
                  imageA={sortedVisits.first?.medicalImages?.[0]?.imageUrl || ""}
                  imageB={sortedVisits.second?.medicalImages?.[0]?.imageUrl || ""}
                  labelA={`T0 (${formatDate(sortedVisits.first?.visitDate, "DD.MM.YYYY")})`}
                  labelB={`T1 (${formatDate(sortedVisits.second?.visitDate, "DD.MM.YYYY")})`}
                  className="w-full h-full"
                  aspectRatio="video"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-2">
                <span>← Trượt sang trái để xem chi tiết phim T0</span>
                {improving && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5" /> TIẾN TRIỂN TỐT
                  </Badge>
                )}
                <span>Trượt sang phải để xem chi tiết phim T1 →</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visit 1 Card */}
              <div className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm flex flex-col">
                 <div className="p-5 border-b border-border/30 bg-muted/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Base Diagnosis (T0)</span>
                      <h3 className="text-base font-black text-foreground">{formatDate(sortedVisits.first?.visitDate, "DD.MM.YYYY — HH:mm")}</h3>
                    </div>
                    <Badge className={cn("px-3 py-1 rounded-lg border-none font-black text-[10px] uppercase", getRiskBg(riskFirst), getRiskColor(riskFirst))}>
                      {getRiskLabel(riskFirst)} • {riskFirst.toFixed(0)}%
                    </Badge>
                 </div>
                 <div className="p-4 flex-1">
                    <div className="relative aspect-square w-full rounded-2xl bg-black overflow-hidden border border-border/10 shadow-inner group">
                       <Image src={sortedVisits.first?.medicalImages?.[0]?.imageUrl || ""} alt="T0 X-ray" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" unoptimized />
                       {showHeatmap && (
                         <div className="absolute inset-0 opacity-60 mix-blend-screen pointer-events-none">
                           <Image src={sortedVisits.first?.medicalImages?.[0]?.imageUrl || ""} alt="T0 Heatmap" fill className="object-cover" unoptimized />
                         </div>
                       )}
                       <div className="absolute top-4 left-4 p-2.5 bg-background/80 backdrop-blur-md rounded-xl border border-border shadow-sm flex items-center gap-2 z-10 pointer-events-auto">
                          <Calendar className="h-4 w-4 text-primary" />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setViewerSrc(sortedVisits.first?.medicalImages?.[0]?.imageUrl);
                              setViewerOpen(true);
                            }}
                            className="bg-black/60 hover:bg-black/80 text-white h-7 text-[10px] font-bold px-2.5 rounded-lg border-none backdrop-blur-sm"
                          >
                            <Search className="h-3 w-3 mr-1" /> Tinh chỉnh
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Visit 2 Card */}
              <div className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm flex flex-col">
                 <div className="p-5 border-b border-border/30 bg-primary/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-primary/70 tracking-widest">Follow-up (T1)</span>
                      <h3 className="text-base font-black text-foreground">{formatDate(sortedVisits.second?.visitDate, "DD.MM.YYYY — HH:mm")}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       {improving && <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> TIẾN TRIỂN TỐT</Badge>}
                       <Badge className={cn("px-3 py-1 rounded-lg border-none font-black text-[10px] uppercase", getRiskBg(riskSecond), getRiskColor(riskSecond))}>
                          {getRiskLabel(riskSecond)} • {riskSecond.toFixed(0)}%
                       </Badge>
                    </div>
                 </div>
                 <div className="p-4 flex-1">
                    <div className="relative aspect-square w-full rounded-2xl bg-black overflow-hidden border border-border/10 shadow-inner group">
                       <Image src={sortedVisits.second?.medicalImages?.[0]?.imageUrl || ""} alt="T1 X-ray" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" unoptimized />
                       {showHeatmap && (
                         <div className="absolute inset-0 opacity-60 mix-blend-screen pointer-events-none">
                           <Image src={sortedVisits.second?.medicalImages?.[0]?.imageUrl || ""} alt="T1 Heatmap" fill className="object-cover" unoptimized />
                         </div>
                       )}
                       <div className="absolute top-4 left-4 p-2.5 bg-background/80 backdrop-blur-md rounded-xl border border-border shadow-sm flex items-center gap-2 z-10 pointer-events-auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setViewerSrc(sortedVisits.second?.medicalImages?.[0]?.imageUrl);
                              setViewerOpen(true);
                            }}
                            className="bg-black/60 hover:bg-black/80 text-white h-7 text-[10px] font-bold px-2.5 rounded-lg border-none backdrop-blur-sm"
                          >
                            <Search className="h-3 w-3 mr-1" /> Tinh chỉnh
                          </Button>
                       </div>
                       <div className="absolute top-4 right-4 p-3 bg-white text-primary rounded-2xl font-black text-sm shadow-xl animate-bounce">
                          {Math.abs(delta).toFixed(1)}% {improving ? "↓" : "↑"}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Expert Assessment - Compacter */}
          <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <FileText className="h-5 w-5" />
                   </div>
                   <h3 className="text-base font-black text-foreground tracking-tight">NHẬN ĐỊNH LÂM SÀNG CỦA BÁC SĨ</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 italic bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10">
                   <AlertTriangle className="h-3 w-3" /> Xác nhận lưu vào hồ sơ bệnh án
                </div>
             </div>
             
             <textarea 
               placeholder="Ghi chú về sự thay đổi vùng thâm nhiễm, các khuyến nghị điều trị bổ sung..." 
               className="w-full min-h-[100px] rounded-2xl bg-muted/10 border border-border/30 p-5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/40"
             />

             <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" className="rounded-xl font-bold h-11 px-8 text-muted-foreground hover:bg-muted">Lưu bản nháp</Button>
                <Button className="rounded-xl px-12 h-11 font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 items-center gap-2">
                   XÁC NHẬN KẾT QUẢ <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </div>
      )}
      <ImageViewer src={viewerSrc} open={viewerOpen} onOpenChange={setViewerOpen} />
    </div>
  );
}
