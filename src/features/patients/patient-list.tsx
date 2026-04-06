"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPatients, deletePatientThunk } from "@/store/slices/patientSlice";

import { usePatientTable } from "./patient-table/use-patient-table";
import { PatientTable } from "./patient-table/patient-table";
import { QuickAddPatientDialog } from "@/components/patients/quick-add-patient-dialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Loader2,
  Upload,
  Download,
  Users,
  X,
  UserPlus,
  Search,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Patient } from "@/types/patient";
import { DateRange } from "react-day-picker";

import { PageHeader } from "@/components/layout/page-header";

import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableDateRangePicker } from "@/components/ui/data-table-date-range-picker";
import { format } from "date-fns";

const PATIENT_COLUMN_LABELS = {
  code: "Mã BN",
  fullName: "Họ tên",
  age: "Tuổi",
  gender: "Giới tính",
  phone: "Số điện thoại",
  address: "Địa chỉ",
  STT: "STT",
};

export function PatientList() {
  const dispatch = useDispatch<AppDispatch>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { patients, isLoading, error, totalElements, totalPages, currentPage, pageSize } = useSelector((state: RootState) => state.patient);

  const [pagination, setPagination] = useState({
    pageIndex: currentPage - 1,
    pageSize: pageSize,
  });

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { table, columns, globalFilter, setGlobalFilter, columnFilters } = usePatientTable({
    data: patients,
    rowCount: totalElements,
    pageCount: totalPages,
    pagination,
    onPaginationChange: setPagination,
    onEditClick: handleEdit,
    onDeleteClick: handleDeleteClick,
  });

  function handleEdit(patient: Patient) {
    setEditingPatient(patient);
    setShowFormDialog(true);
  }

  function handleDeleteClick(patient: Patient) {
    setPatientToDelete(patient);
  }

  useEffect(() => {
    setPagination(prev => prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 });
  }, [globalFilter, columnFilters, dateRange]);

  useEffect(() => {
    if (!isMounted) return;

    const filters = {
      search: globalFilter,
      gender: columnFilters.find(f => f.id === 'gender')?.value as string[],
      startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const promise = dispatch(fetchPatients({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      filters
    }));

    return () => promise.abort();
  }, [dispatch, pagination, globalFilter, columnFilters, dateRange, isMounted]);

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      setIsDeleting(true);
      await dispatch(deletePatientThunk(patientToDelete.id)).unwrap();
      toast.success(`Đã xóa hồ sơ bệnh nhân ${patientToDelete.fullName}`);
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Không thể xoá bệnh nhân");
    } finally {
      setIsDeleting(false);
      setPatientToDelete(null);
    }
  };

  const hasActiveFilters = table.getState().columnFilters.length > 0 || !!globalFilter || !!dateRange;

  return (
    <div className="space-y-5 pb-6 w-full overflow-x-hidden">
      {/* ── Page Header ────────────────────────────── */}
      <PageHeader
        title="Hồ sơ bệnh nhân"
        subtitle={`Tổng cộng ${totalElements ?? "..."} bệnh nhân đang được quản lý`}
        icon={Users}
        stats={[
          { label: "Tổng bệnh nhân", value: totalElements ?? 0, color: "text-primary" },
          { label: "Trang hiện tại", value: `${pagination.pageIndex + 1} / ${totalPages || 1}`, color: "text-foreground" },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl gap-1.5 border-border/50 bg-card shadow-sm text-[13px] font-semibold"
        >
          <Upload className="h-3.5 w-3.5" /> Xuất
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl gap-1.5 border-border/50 bg-card shadow-sm text-[13px] font-semibold"
        >
          <Download className="h-3.5 w-3.5" /> Nhập
        </Button>
        <Button
          size="sm"
          className="h-9 rounded-xl gap-1.5 shadow-md shadow-primary/20 text-[13px] font-semibold"
          onClick={() => { setEditingPatient(null); setShowFormDialog(true); }}
        >
          <UserPlus className="h-3.5 w-3.5" /> Thêm bệnh nhân
        </Button>
      </PageHeader>

      {/* ── Toolbar (Search + Filters) ─────────────── */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm mã BN, họ tên, SĐT..."
              className="h-9 w-full rounded-xl border border-border/50 bg-muted/30 pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Date Range Picker */}
          <DataTableDateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Ngày tiếp nhận"
          />

          <div className="flex items-center gap-2 ml-auto">
            {/* Reset */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  table.resetColumnFilters();
                  setGlobalFilter("");
                  setDateRange(undefined);
                }}
                className="h-9 px-3 text-[13px] font-semibold text-muted-foreground rounded-xl hover:bg-muted/50"
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Đặt lại
              </Button>
            )}
            {/* View options */}
            <div className="border-l border-border/40 pl-3">
              <DataTableViewOptions
                table={table}
                columnLabels={PATIENT_COLUMN_LABELS}
              />
            </div>
          </div>
        </div>

        {/* Active filter indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-primary">Đang lọc dữ liệu</span>
            {globalFilter && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                Tìm kiếm: &ldquo;{globalFilter}&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table ─────────────────────────────────── */}
      {isLoading && patients.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[13px] font-semibold text-muted-foreground">Đang tải dữ liệu bệnh nhân...</p>
        </div>
      ) : error && !patients.length ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-[13px] font-semibold text-destructive">{error}</p>
        </div>
      ) : (
        <PatientTable table={table} columns={columns} globalFilter={globalFilter} />
      )}

      {/* ── Dialogs ──────────────────────────────── */}
      <QuickAddPatientDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        patient={editingPatient}
        onSuccess={() => {
          dispatch(fetchPatients({
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
          }));
        }}
      />

      <Dialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-[17px]">Xác nhận xóa hồ sơ</DialogTitle>
            <DialogDescription className="text-[13px]">
              Bạn có chắc chắn muốn xóa bệnh nhân <strong className="text-foreground">{patientToDelete?.fullName}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setPatientToDelete(null)} disabled={isDeleting} className="flex-1 rounded-xl">
              Hủy bỏ
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="flex-1 rounded-xl">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Đang xóa..." : "Xóa hồ sơ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
