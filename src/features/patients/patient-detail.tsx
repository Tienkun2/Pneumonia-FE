"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPatientById } from "@/store/slices/patientSlice";
import { fetchPatientVisits, deleteVisitThunk } from "@/store/slices/visitSlice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, PlusCircle, Loader2, MoreVertical, Edit, Trash2, Activity, FileCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { QuickAddVisitDialog } from "@/components/patients/quick-add-visit-dialog";
import { Badge } from "@/components/ui/badge";
import { Visit } from "@/types/visit";
import { toast } from "sonner";

export function PatientDetail({ patientId }: { patientId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { selectedPatient: patient, isLoading: isPatientLoading, error: patientError } = useSelector((state: RootState) => state.patient);
  const { visits, isLoading: isVisitsLoading, error: visitsError } = useSelector((state: RootState) => state.visit);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
      dispatch(fetchPatientVisits(patientId));
    }
  }, [dispatch, patientId]);

  const handleCreateVisit = () => {
    setEditingVisit(null);
    setShowVisitDialog(true);
  };

  const handleEditVisit = (visit: Visit) => {
    setEditingVisit(visit);
    setShowVisitDialog(true);
  };

  const confirmDeleteVisit = async () => {
    if (!visitToDelete) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteVisitThunk(visitToDelete.id)).unwrap();
      toast.success("Đã xóa lượt khám");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Không thể xoá lượt khám");
    } finally {
      setIsDeleting(false);
      setVisitToDelete(null);
    }
  };

  if (isPatientLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (patientError || !patient) {
    return <div className="py-10 text-center text-red-500">{patientError || "Không tìm thấy bệnh nhân"}</div>;
  }

  const translateGender = (gender: string) => {
    switch (gender) {
      case "MALE": return "Nam";
      case "FEMALE": return "Nữ";
      default: return "Khác";
    }
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chi tiết bệnh nhân</h1>
            <p className="text-muted-foreground">
              Thông tin và lịch sử lượt khám
            </p>
          </div>
        </div>
        <Button onClick={handleCreateVisit}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm Lượt Khám
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Patient Basic Info */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã bệnh nhân</p>
                <p className="font-medium">{patient.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Họ tên</p>
                <p className="font-medium">{patient.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tuổi</p>
                  <p className="font-medium">{calculateAge(patient.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <p className="font-medium">
                    {translateGender(patient.gender)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày sinh</p>
                <p className="font-medium">{patient.dateOfBirth ? formatDate(patient.dateOfBirth, "DD/MM/YYYY") : "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Người giám hộ</p>
                <p className="font-medium">{patient.guardianName || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{patient.phone || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{patient.address || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày tạo hồ sơ</p>
                <p className="font-medium">{formatDate(patient.createdAt, "DD/MM/YYYY")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Visits Timeline */}
        <div className="space-y-6 md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Lịch sử khám bệnh</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isVisitsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : visitsError ? (
                <div className="py-12 text-center text-red-500">{visitsError}</div>
              ) : !visits || visits.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-dashed border-border">
                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="mb-4 font-medium">Bệnh nhân này chưa có lượt khám nào.</p>
                  <Button variant="outline" onClick={handleCreateVisit} className="rounded-xl border-border">
                    Tạo lượt khám đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="relative p-6 px-8">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[2.45rem] top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-transparent pointer-events-none" />

                  <div className="space-y-8">
                    {visits.map((visit, index) => {
                      return (
                        <div key={visit.id} className="relative flex gap-6 group">
                          {/* Dot / Indicator */}
                          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border-2 border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)] mt-1 transition-transform group-hover:scale-110">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>

                          {/* Content Card */}
                          <div className="flex-1 space-y-4 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-lg text-foreground leading-none">
                                    Lượt khám #{visits.length - index}
                                  </h4>
                                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px] py-0.5 uppercase tracking-wider">
                                    {formatDate(visit.visitDate, "DD/MM/YYYY")}
                                  </Badge>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest pt-1">
                                    <Loader2 className="h-3 w-3 animate-none opacity-50" />
                                    BS. {visit.createdBy || "Chưa xác định"} • {formatDate(visit.visitDate, "HH:mm")}
                                </p>
                              </div>
                              
                              <div className="flex gap-2 items-center">
                                {visit.diagnoses && visit.diagnoses.length > 0 && (
                                  <Link href={`/results/${visit.id}`}>
                                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground border-none hover:bg-primary/90 h-9 px-4 rounded-xl gap-2 font-bold shadow-md">
                                      <FileCheck className="h-4 w-4" />
                                      Kết quả AI
                                    </Button>
                                  </Link>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted">
                                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-1 w-40">
                                    <DropdownMenuItem onClick={() => handleEditVisit(visit)} className="cursor-pointer rounded-lg font-bold gap-2">
                                      <Edit className="h-4 w-4 text-blue-600" />
                                      <span>Điều chỉnh</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisitToDelete(visit)} className="cursor-pointer rounded-lg font-bold gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                                      <Trash2 className="h-4 w-4" />
                                      <span>Xóa bỏ</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            {/* Clinical Data Summary */}
                            <div className="grid grid-cols-1 gap-3 p-4 rounded-2xl bg-muted/30 border border-border text-sm">
                              {visit.symptoms ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Triệu chứng lâm sàng</span>
                                  <p className="text-foreground/80 leading-relaxed font-medium">{visit.symptoms}</p>
                                </div>
                              ) : (
                                <p className="text-muted-foreground italic text-xs">Không có dữ liệu triệu chứng lâm sàng được ghi nhận.</p>
                              )}
                              
                              {visit.note && (
                                <div className="space-y-1 pt-2 border-t border-border">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Ghi chú bác sĩ</span>
                                  <p className="text-foreground/60 italic text-[13px]">{visit.note}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Resources Footer */}
                            <div className="flex gap-2 pt-1">
                               <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                                  <Activity className="h-3 w-3" /> {visit.medicalImages?.length || 0} Ảnh X-Ray
                               </div>
                               <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                  <ShieldCheck className="h-3 w-3" /> {visit.diagnoses?.length || 0} Diagnosis
                               </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showVisitDialog && (
        <QuickAddVisitDialog
          patientId={patientId}
          open={showVisitDialog}
          onOpenChange={setShowVisitDialog}
          visit={editingVisit}
        />
      )}

      {/* Delete Dialog */}
      <Dialog open={!!visitToDelete} onOpenChange={(open) => !open && setVisitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa lượt khám</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa lượt khám ngày <strong>{visitToDelete ? formatDate(visitToDelete.visitDate, "DD/MM/YYYY") : ""}</strong>?
              Toàn bộ Ảnh X-Ray và Kết luận AI của lượt khám này cũng sẽ bị xoá đi. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setVisitToDelete(null)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteVisit} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
