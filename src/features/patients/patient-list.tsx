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
  X
} from "lucide-react";
import { toast } from "sonner";
import { Patient } from "@/types/patient";
import { DateRange } from "react-day-picker";

import { PageHeader } from "@/components/layout/page-header";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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

  return (
    <div className="space-y-4 px-2 pb-4 w-full overflow-x-hidden">
      <PageHeader
        title="Hồ sơ bệnh nhân"
        icon={Users}
      />

      <TableToolbar
        placeholder="Tìm mã BN, tên, SĐT..."
        value={globalFilter}
        onChange={setGlobalFilter}
      >
        <DataTableDateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          placeholder="Ngày tiếp nhận"
        />

        {(table.getState().columnFilters.length > 0 || globalFilter || dateRange) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              setGlobalFilter("");
              setDateRange(undefined);
            }}
            className="h-9 px-2 lg:px-3 text-muted-foreground border-dashed"
          >
            <X className="mr-2 h-4 w-4" />
            Đặt lại
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2">
            <Upload className="h-4 w-4" />
            Xuất
          </Button>
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2">
            <Download className="h-4 w-4" />
            Nhập
          </Button>
          <Button size="sm" className="h-9 shrink-0 rounded-lg" onClick={() => { setEditingPatient(null); setShowFormDialog(true); }}>
            Thêm bệnh nhân
          </Button>
          <DataTableViewOptions
            table={table}
            columnLabels={PATIENT_COLUMN_LABELS}
          />
        </div>
      </TableToolbar>

      {isLoading && patients.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error && !patients.length ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <>
          <PatientTable table={table} columns={columns} globalFilter={globalFilter} />
          <DataTablePagination table={table} itemName="bệnh nhân" />
        </>
      )}

      {/* Forms & Dialogs */}
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

      {/* Delete Dialog */}
      <Dialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa hồ sơ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bệnh nhân <strong>{patientToDelete?.fullName}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPatientToDelete(null)} disabled={isDeleting} className="rounded-xl">
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="rounded-xl">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
