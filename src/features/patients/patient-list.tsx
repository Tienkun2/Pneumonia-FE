"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPatients, deletePatientThunk } from "@/store/slices/patientSlice";

import { usePatientTable } from "./patient-table/use-patient-table";
import { PatientTable } from "./patient-table/patient-table";
import { QuickAddPatientDialog } from "@/components/patients/quick-add-patient-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

import { Search, Loader2, Upload, Download, Settings2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Users } from "lucide-react";
import { toast } from "sonner";
import { Patient } from "@/types/patient";

export function PatientList() {
  const dispatch = useDispatch<AppDispatch>();
  const { patients, isLoading, error, totalElements, totalPages, currentPage, pageSize } = useSelector((state: RootState) => state.patient);

  const [pagination, setPagination] = useState({
    pageIndex: currentPage - 1, // table uses 0-based
    pageSize: pageSize,
  });

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setShowFormDialog(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const { table, columns, globalFilter, setGlobalFilter } = usePatientTable({
    data: patients,
    rowCount: totalElements,
    pageCount: totalPages,
    pagination,
    onPaginationChange: setPagination,
    onEditClick: handleEdit,
    onDeleteClick: handleDeleteClick,
  });

  useEffect(() => {
    dispatch(fetchPatients({ 
      page: pagination.pageIndex + 1, 
      size: pagination.pageSize,
    }));
  }, [dispatch, pagination.pageIndex, pagination.pageSize]);

  const handleCreateNew = () => {
    setEditingPatient(null);
    setShowFormDialog(true);
  };

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

  const handleExport = () => {
    toast.success("Đang xuất dữ liệu...");
    setTimeout(() => {
      toast.success("Xuất dữ liệu thành công!");
    }, 1000);
  };

  return (
    <div className="space-y-4 px-2 pb-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý bệnh nhân</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search & Filters (Left) */}
        <div className="flex items-center gap-2 flex-1 w-full flex-wrap">
          <div className="relative w-full max-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mã BN, tên..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2" onClick={handleExport}>
            <Upload className="h-4 w-4" />
            Xuất
          </Button>
          <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2">
            <Download className="h-4 w-4" />
            Nhập
          </Button>
          <Button size="sm" className="h-9 shrink-0" onClick={handleCreateNew}>
            Thêm bệnh nhân
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 shrink-0 gap-2 font-normal ml-auto">
                <Settings2 className="h-4 w-4" />
                Hiển thị cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Chọn cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    column.accessorFn !== undefined && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "code" && "Mã BN"}
                      {column.id === "fullName" && "Họ tên"}
                      {column.id === "age" && "Tuổi"}
                      {column.id === "gender" && "Giới tính"}
                      {column.id === "phone" && "Số điện thoại"}
                      {column.id === "address" && "Địa chỉ"}
                      {column.id === "STT" && "STT"}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table Area */}
      {isLoading && patients.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error && !patients.length ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <PatientTable table={table} columns={columns} globalFilter={globalFilter} />
      )}

      {/* Footer / Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-sm text-gray-500">
        <div>
          Tổng cộng: <span className="font-medium text-gray-900">{totalElements}</span> dòng
        </div>
        
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">Số hàng</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center font-medium text-gray-900">
            Trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount() || 1}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang đầu</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang cuối</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa hồ sơ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bệnh nhân <strong>{patientToDelete?.fullName}</strong>?
              Hành động này không thể hoàn tác và sẽ cập nhật liên đới các thông tin khác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPatientToDelete(null)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
