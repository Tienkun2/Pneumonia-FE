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
}

export const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(
  ({ visit, patient, totalWeightedScore }, ref) => {
    const imageUrl = visit.medicalImages?.[0]?.imageUrl || "";
    const symptoms = visit.symptoms?.split(",").map(s => s.trim()).filter(Boolean) || [];

    return (
      <div ref={ref} className="bg-white text-black p-6 w-[210mm] min-h-[297mm] mx-auto text-sm print-container">
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white font-bold">
                <span className="text-2xl leading-none tracking-tighter">PX</span>
                <span className="text-[9px] mt-0.5 tracking-widest uppercase">PlumoX</span>
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Hệ Thống Chẩn Đoán Phổi AI</h1>
                <p className="text-sm font-semibold text-slate-600 mt-1">Khoa Chẩn đoán Hình ảnh • Phòng khám Đa khoa</p>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-xl font-black uppercase tracking-widest text-slate-800">Phiếu Kết Quả</h2>
             <p className="text-sm font-bold text-slate-500 mt-1.5">Mã Ca Khám: <span className="text-slate-900">#{visit.id.slice(0, 8).toUpperCase()}</span></p>
             <p className="text-sm font-bold text-slate-500">Ngày in: <span className="text-slate-900">{format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}</span></p>
          </div>
        </div>

        {/* PATIENT INFO */}
        <div className="mb-4 page-break-inside-avoid">
           <h3 className="text-sm font-black bg-slate-100 px-3 py-1.5 rounded text-slate-800 mb-3 border-l-4 border-blue-600 uppercase tracking-widest">1. Thông tin hành chính</h3>
           <div className="grid grid-cols-2 gap-x-12 gap-y-2 px-4">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                 <span className="text-slate-500 font-medium">Mã Bệnh Nhân:</span>
                 <span className="font-bold text-slate-900">{patient?.code || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                 <span className="text-slate-500 font-medium">Họ và Tên:</span>
                 <span className="font-bold text-slate-900 uppercase">{patient?.fullName || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                 <span className="text-slate-500 font-medium">Giới tính:</span>
                 <span className="font-bold text-slate-900">{translateGender(patient?.gender)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                 <span className="text-slate-500 font-medium">Năm sinh:</span>
                 <span className="font-bold text-slate-900">{patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), "yyyy") : "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 col-span-2">
                 <span className="text-slate-500 font-medium shrink-0">Triệu chứng lâm sàng:</span>
                 <span className="font-bold text-slate-900 text-right">{symptoms.length > 0 ? symptoms.join(", ") : "Không ghi nhận triệu chứng"}</span>
              </div>
           </div>
        </div>

        {/* MEDICAL IMAGE */}
        <div className="mb-4 page-break-inside-avoid">
           <h3 className="text-sm font-black bg-slate-100 px-3 py-1.5 rounded text-slate-800 mb-3 border-l-4 border-blue-600 uppercase tracking-widest">2. Hình ảnh X-Quang / Grad-CAM</h3>
           <div className="flex justify-center bg-slate-50 rounded-xl border border-slate-200 p-2">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="X-ray" className="max-h-[280px] object-contain rounded-lg" />
              ) : (
                <div className="h-[250px] w-full flex items-center justify-center text-slate-400 font-medium italic">Không có hình ảnh đính kèm</div>
              )}
           </div>
        </div>

        {/* DIAGNOSIS RESULTS */}
        <div className="mb-4 page-break-inside-avoid">
           <h3 className="text-sm font-black bg-slate-100 px-3 py-1.5 rounded text-slate-800 mb-3 border-l-4 border-blue-600 uppercase tracking-widest">3. Kết luận chẩn đoán</h3>
           <div className="grid grid-cols-2 gap-6 px-4">
              <div className="space-y-3">
                 <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Kết quả phân tích AI:</p>
                    <p className="text-xl font-black uppercase text-slate-900">{visit.diagnosisResult || visit.diagnoses?.[0]?.result || "—"}</p>
                 </div>
                 <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Chỉ số tin cậy (Confidence Score):</p>
                    <p className="text-lg font-bold text-blue-600">{totalWeightedScore.toFixed(1)}%</p>
                 </div>
                 <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Mô hình AI áp dụng:</p>
                    <p className="text-sm font-bold text-slate-700">{visit.diagnoses?.[0]?.modelVersion || "PlumoX Core Vision v1.2"}</p>
                 </div>
              </div>
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/60">
                 <p className="text-xs font-black text-amber-800 mb-2 uppercase tracking-widest border-b border-amber-200 pb-2">Ghi chú & Chỉ định của bác sĩ</p>
                 <p className="text-sm text-slate-800 italic leading-relaxed font-medium min-h-[60px]">
                    {visit.note || "Bệnh nhân tiếp tục theo dõi sát các triệu chứng hô hấp. Khám lại ngay nếu có biểu hiện ho kéo dài, sốt cao hoặc khó thở."}
                 </p>
              </div>
           </div>
        </div>

        {/* SIGNATURES */}
        <div className="mt-6 pt-4 page-break-inside-avoid flex justify-end">
           <div className="text-center w-64">
              <p className="text-sm font-medium italic text-slate-600 mb-1">Ngày {format(new Date(visit.visitDate), "dd")} tháng {format(new Date(visit.visitDate), "MM")} năm {format(new Date(visit.visitDate), "yyyy")}</p>
              <p className="text-sm font-black uppercase tracking-widest text-slate-800 mb-14">Bác sĩ chẩn đoán</p>
              <p className="text-sm font-bold border-t-2 border-slate-300 pt-2 uppercase tracking-wider text-slate-900">{visit.createdBy || "BS. CHUYÊN KHOA"}</p>
           </div>
        </div>
      </div>
    );
  }
);
PrintReport.displayName = "PrintReport";
