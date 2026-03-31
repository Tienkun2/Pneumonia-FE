"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPatients } from "@/store/slices/patientSlice";
import { fetchPatientVisits } from "@/store/slices/visitSlice";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Image as ImageIcon,
  ChevronRight,
  Info
} from "lucide-react";
import Image from "next/image";
import { RiskGauge } from "@/components/medical/risk-gauge";
import { formatDate } from "@/lib/utils";
import { Visit } from "@/types/visit";
import { Badge } from "@/components/ui/badge";

export function ComparisonView() {
  const dispatch = useAppDispatch();
  const { patients } = useAppSelector((state) => state.patient);
  const { visits, isLoading: isVisitsLoading } = useAppSelector((state) => state.visit);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [visitAId, setVisitAId] = useState<string>("");
  const [visitBId, setVisitBId] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, size: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedPatientId) {
      dispatch(fetchPatientVisits(selectedPatientId));
      setVisitAId("");
      setVisitBId("");
      setIsComparing(false);
    }
  }, [selectedPatientId, dispatch]);

  const visitA = visits.find((v) => v.id === visitAId);
  const visitB = visits.find((v) => v.id === visitBId);

  // Mock Risk Logic for Demo
  const getMockRisk = (visit: Visit | undefined) => {
     if (!visit) return 0;
     // Deterministic mock risk
     const codePoint = visit.id.codePointAt(0) || 0;
     return (codePoint % 60) + 30; // 30-90%
  };

  const riskA = getMockRisk(visitA);
  const riskB = getMockRisk(visitB);
  const delta = riskB - riskA;

  const handleStartComparison = () => {
     if (visitA && visitB) {
        setIsComparing(true);
     }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
           <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
             <ArrowLeftRight className="h-5 w-5" />
           </div>
           <div>
             <h1 className="text-2xl font-bold tracking-tight text-foreground">So sánh tiến triển</h1>
           </div>
        </div>
      </div>

      {/* Selection Panel */}
      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                 <Search className="h-4 w-4" /> Bệnh nhân
              </label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="h-10 bg-background rounded-lg border-border shadow-sm font-medium">
                  <SelectValue placeholder="Tìm kiếm bệnh nhi..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.fullName} ({p.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                 <Calendar className="h-4 w-4" /> Lượt khám Cơ sở
              </label>
              <Select 
                value={visitAId} 
                onValueChange={setVisitAId} 
                disabled={!selectedPatientId || isVisitsLoading}
              >
                <SelectTrigger className="h-10 bg-background rounded-lg border-border shadow-sm font-medium">
                  <SelectValue placeholder={isVisitsLoading ? "Đang tải..." : "Chọn ngày khám..."} />
                </SelectTrigger>
                <SelectContent>
                  {visits.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{formatDate(v.visitDate, "DD/MM/YYYY")} - {v.createdBy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                 <Calendar className="h-4 w-4" /> Lượt khám Đối chiếu
              </label>
              <Select 
                value={visitBId} 
                onValueChange={setVisitBId}
                disabled={!selectedPatientId || isVisitsLoading}
              >
                <SelectTrigger className="h-10 bg-background rounded-lg border-border shadow-sm font-medium">
                  <SelectValue placeholder={isVisitsLoading ? "Đang tải..." : "Chọn ngày khám..."} />
                </SelectTrigger>
                <SelectContent>
                  {visits.filter(v => v.id !== visitAId).map((v) => (
                    <SelectItem key={v.id} value={v.id}>{formatDate(v.visitDate, "DD/MM/YYYY")} - {v.createdBy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex">
               <Button 
                onClick={handleStartComparison} 
                disabled={!visitAId || !visitBId}
                className="bg-blue-600 hover:bg-blue-700 h-10 w-full rounded-lg shadow-sm font-semibold gap-2 transition-all active:scale-95"
               >
                 Phân tích <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Workspace */}
      {isComparing && (
         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Delta Card */}
            <div className={`p-8 rounded-[2.5rem] border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 transition-all ${delta <= 0 ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900" : "bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900"}`}>
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-black text-foreground">Kết quả phân tích tiến triển</h3>
                  <p className="text-muted-foreground max-w-md">
                     {delta <= 0 
                        ? "Hệ thống phát hiện các dấu hiệu phục hồi tích cực. Vùng tổn thương phổi đang có xu hướng thu hẹp." 
                        : "Cảnh báo: Có sự gia tăng các chỉ số nguy cơ. Cần xem xét lại phác đồ điều trị hiện tại."}
                  </p>
               </div>
               
               <div className="flex items-center gap-6">
                  <div className={`p-6 rounded-[2rem] bg-card border border-border shadow-xl flex flex-col items-center gap-1 min-w-[200px]`}>
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Thay đổi nguy cơ</span>
                     <div className={`text-4xl font-black flex items-center gap-1 ${delta <= 0 ? "text-emerald-500" : "text-orange-500"}`}>
                        {delta <= 0 ? <TrendingDown className="h-8 w-8" /> : <TrendingUp className="h-8 w-8" />}
                        {Math.abs(delta).toFixed(1)}%
                     </div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <Badge className={delta <= 0 ? "bg-emerald-500" : "bg-orange-500"}>
                        {delta <= 0 ? "Tiến triển Tốt" : "Cần Chú ý"}
                     </Badge>
                     <Button variant="ghost" className="text-muted-foreground text-xs gap-1">
                        <Info className="h-3 w-3" /> Chi tiết thuật toán
                     </Button>
                  </div>
               </div>
            </div>

            {/* Side by Side Views */}
            <div className="grid gap-8 lg:grid-cols-2">
               {/* Left: Visit A */}
               <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white p-6">
                     <div className="flex justify-between items-center">
                        <div>
                           <CardTitle className="text-xl">Trước (Lần 1)</CardTitle>
                           <CardDescription className="text-slate-400">
                              Ngày {formatDate(visitA?.visitDate, "DD/MM/YYYY")}
                           </CardDescription>
                        </div>
                        <ImageIcon className="h-6 w-6 text-slate-600" />
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     <div className="aspect-[4/5] rounded-[2rem] bg-muted overflow-hidden relative shadow-inner">
                        <Image 
                          src="https://via.placeholder.com/800x1000?text=X-Ray+Visit+A" 
                          width={800}
                          height={1000}
                          className="w-full h-full object-cover" 
                          alt="XRay A"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                     </div>
                     <div className="flex items-center justify-center p-6 bg-muted/50 rounded-3xl">
                        <RiskGauge 
                          riskScore={riskA} 
                          riskLevel={riskA > 70 ? "Cao" : riskA > 40 ? "Trung bình" : "Thấp"} 
                          label="Nguy cơ AI"
                        />
                     </div>
                  </CardContent>
               </Card>

               {/* Right: Visit B */}
               <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-blue-600 text-white p-6">
                     <div className="flex justify-between items-center">
                        <div>
                           <CardTitle className="text-xl">Sau (Lần 2)</CardTitle>
                           <CardDescription className="text-blue-200 font-medium">
                              Ngày {formatDate(visitB?.visitDate, "DD/MM/YYYY")}
                           </CardDescription>
                        </div>
                        <ImageIcon className="h-6 w-6 text-blue-300" />
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     <div className="aspect-[4/5] rounded-[2rem] bg-muted overflow-hidden relative shadow-inner">
                        <Image 
                          src="https://via.placeholder.com/800x1000?text=X-Ray+Visit+B" 
                          width={800}
                          height={1000}
                          className="w-full h-full object-cover" 
                          alt="XRay B"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                     </div>
                     <div className="flex items-center justify-center p-6 bg-primary/5 rounded-3xl">
                        <RiskGauge 
                          riskScore={riskB} 
                          riskLevel={riskB > 70 ? "Cao" : riskB > 40 ? "Trung bình" : "Thấp"} 
                          label="Nguy cơ AI"
                        />
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      )}

      {/* Empty State */}
      {!selectedPatientId && (
         <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
               <ArrowLeftRight className="h-8 w-8 text-slate-300" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-slate-800">Bắt đầu so sánh</h3>
               <p className="text-sm text-slate-500 max-w-sm mt-1">Chọn một bệnh nhi ở danh sách trên để xem lại hành trình của họ qua các lần X-Quang.</p>
            </div>
         </div>
      )}
    </div>
  );
}
