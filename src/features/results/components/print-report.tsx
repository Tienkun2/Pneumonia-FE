import React, { forwardRef } from "react";
import { Visit } from "@/types/diagnosis";
import { Patient } from "@/types/patient";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { translateGender } from "@/lib/utils";

interface PrintReportProps {
  visit: Visit;
  patient: Patient | null;
  totalWeightedScore: number;
  hospitalName?: string;
}

function renderInlineBold(text: string) {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-extrabold text-slate-950">{part}</strong>;
    }
    return part;
  });
}

function renderPrintNote(noteText: string) {
  if (!noteText) return null;
  const lines = noteText.split("\n");
  const hasMarkdown = lines.some(line => {
    const t = line.trim();
    return t.startsWith("## ") || t.startsWith("### ") || t.startsWith("- ") || t.startsWith("* ");
  });
  
  if (!hasMarkdown) {
    return <p className="text-[10px] text-slate-800 italic leading-relaxed whitespace-pre-line">&quot;{noteText}&quot;</p>;
  }
  
  return (
    <div className="prose max-w-none text-[9.5px] space-y-0.5 text-slate-800 leading-normal">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("## ") || trimmedLine.startsWith("### ")) {
          const text = trimmedLine.replace(/^#{2,3}\s+/, "");
          return <h4 key={idx} className="font-black text-[10.5px] text-slate-900 mt-2 mb-0.5 border-b border-slate-200 pb-0.5 uppercase tracking-wide">{text}</h4>;
        }
        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          const text = trimmedLine.replace(/^[-*]\s+/, "");
          return (
            <ul key={idx} className="list-disc pl-3.5 my-0.5">
              <li>{renderInlineBold(text)}</li>
            </ul>
          );
        }
        return <p key={idx} className="my-0.5">{renderInlineBold(trimmedLine)}</p>;
      })}
    </div>
  );
}

export const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(
  ({ visit, patient, totalWeightedScore, hospitalName }, ref) => {
    const imageUrl = visit.medicalImages?.[0]?.imageUrl || "";
    const symptoms = visit.symptoms?.split(",").map(s => s.trim()).filter(Boolean) || [];
    const rawResult = visit.diagnosisResult || visit.diagnoses?.[0]?.result;
    const translatedResult = rawResult === "PNEUMONIA" ? "Viêm phổi" : rawResult === "NORMAL" ? "Bình thường" : rawResult || "—";

    const riskStatus = (() => {
      if (visit.diagnosisResult === "NORMAL") return "Thấp";
      if (visit.diagnosisResult) return totalWeightedScore > 70 ? "Cao" : "Trung bình";
      return totalWeightedScore > 70 ? "Cao" : totalWeightedScore > 40 ? "Trung bình" : "Thấp";
    })();

    return (
      <div ref={ref} className="bg-white text-black p-5 w-[210mm] h-[297mm] mx-auto text-[11px] print-container flex flex-col justify-between overflow-hidden">
        <div>
          {/* HEADER */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 border border-slate-200 rounded-xl p-1.5 bg-white shadow-sm shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/PlumoX_Logo.png" alt="PlumoX" className="object-contain max-w-full max-h-full" />
               </div>
               <div>
                  <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                    {hospitalName || "Bệnh Viện Phổi Trung Ương"}
                  </h1>
                  <p className="text-[9px] font-semibold text-slate-500 mt-0.5">Khoa Chẩn đoán Hình ảnh • Hệ thống chẩn đoán AI PlumoX</p>
               </div>
            </div>
            <div className="text-right">
               <h2 className="text-xs font-black uppercase tracking-wider text-slate-850">Phiếu Kết Quả Chẩn Đoán</h2>
               <p className="text-[9px] font-bold text-slate-500 mt-0.5">Mã Ca Khám: <span className="text-slate-900">#{visit.id.slice(0, 8).toUpperCase()}</span></p>
               <p className="text-[9px] font-bold text-slate-500">Ngày in: <span className="text-slate-900">{format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}</span></p>
            </div>
          </div>

          {/* PATIENT INFO */}
          <div className="mb-2">
             <h3 className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-800 mb-1.5 border-l-4 border-slate-800 uppercase tracking-widest">1. Thông tin hành chính</h3>
             <div className="grid grid-cols-2 gap-x-8 gap-y-1 px-3">
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                   <span className="text-slate-500 font-medium">Mã Bệnh Nhân:</span>
                   <span className="font-bold text-slate-900">{patient?.code || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                   <span className="text-slate-500 font-medium">Họ và Tên:</span>
                   <span className="font-bold text-slate-900 uppercase">{patient?.fullName || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                   <span className="text-slate-500 font-medium">Giới tính:</span>
                   <span className="font-bold text-slate-900">{translateGender(patient?.gender)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                   <span className="text-slate-500 font-medium">Năm sinh:</span>
                   <span className="font-bold text-slate-900">{patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), "yyyy") : "—"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5 col-span-2">
                   <span className="text-slate-500 font-medium shrink-0">Triệu chứng lâm sàng:</span>
                   <span className="font-bold text-slate-900 text-right">{symptoms.length > 0 ? symptoms.join(", ") : "Không ghi nhận triệu chứng"}</span>
                </div>
             </div>
          </div>

          {/* TWO-COLUMN CONTENT GRID */}
          <div className="grid grid-cols-12 gap-3">
             {/* Left Column: Image (5/12) */}
             <div className="col-span-5 flex flex-col gap-1.5">
                <h3 className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-800 border-l-4 border-slate-800 uppercase tracking-widest">2. Hình ảnh X-Quang</h3>
                <div className="flex justify-center bg-slate-50 rounded-xl border border-slate-200 p-1.5 shrink-0 h-[170px] items-center">
                   {imageUrl ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={imageUrl} alt="X-ray" className="max-h-full object-contain rounded-lg" />
                   ) : (
                     <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium italic text-[9px]">Không có hình ảnh đính kèm</div>
                   )}
                </div>
             </div>

             {/* Right Column: Diagnosis & Report (7/12) */}
             <div className="col-span-7 flex flex-col gap-1.5">
                <h3 className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-800 border-l-4 border-slate-800 uppercase tracking-widest">3. Kết luận chẩn đoán</h3>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-2 mb-1">
                   <div className="flex justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-500 font-medium">Kết quả AI:</span>
                      <span className="font-bold text-slate-900 uppercase">{translatedResult}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-500 font-medium">Tin cậy:</span>
                      <span className="font-bold text-blue-600">{totalWeightedScore.toFixed(1)}%</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-500 font-medium">Nguy cơ:</span>
                      <span className={`font-bold uppercase ${
                        riskStatus === "Thấp" 
                          ? "text-emerald-600" 
                          : riskStatus === "Trung bình" 
                          ? "text-amber-500" 
                          : "text-red-500"
                      }`}>{riskStatus}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-500 font-medium">Mô hình:</span>
                      <span className="font-bold text-slate-700">{visit.diagnoses?.[0]?.modelVersion || "v1.0"}</span>
                   </div>
                </div>

                {visit.note && (
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex-1 overflow-hidden">
                     <p className="text-[8.5px] font-black text-slate-800 mb-1 uppercase tracking-widest border-b border-slate-200 pb-0.5">
                        Báo cáo AI chuyên gia & Ghi chú lâm sàng
                     </p>
                     {renderPrintNote(visit.note)}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="pt-1 flex justify-end shrink-0">
           <div className="text-center w-48">
              <p className="text-[9px] font-medium italic text-slate-500 mb-0.5">Ngày {format(new Date(visit.visitDate), "dd")} tháng {format(new Date(visit.visitDate), "MM")} năm {format(new Date(visit.visitDate), "yyyy")}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-800 mb-6">Bác sĩ chẩn đoán</p>
              <p className="text-[9px] font-bold border-t border-slate-300 pt-1 uppercase tracking-wider text-slate-900">{visit.createdBy || "BS. CHUYÊN KHOA"}</p>
           </div>
        </div>
      </div>
    );
  }
);
PrintReport.displayName = "PrintReport";
