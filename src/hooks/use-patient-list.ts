"use client";

import { useState, useEffect, useCallback } from "react";
import { PatientService } from "@/services/patient-service";
import { Patient } from "@/types/patient";
import { toast } from "sonner";
import { usePatientTable } from "@/hooks/use-patient-table";

export function usePatientListing() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await PatientService.getPatients();
      setPatients(data.data || []);
    } catch (error: unknown) {
      toast.error("Không thể tải danh sách bệnh nhân");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const {
      table,
      columns,
      globalFilter,
      setGlobalFilter,
      columnFilters,
  } = usePatientTable({
      data: patients,
      onEditClick: (patient) => {
          setEditingPatient(patient);
          setShowAddDialog(true);
      },
      onDeleteClick: (patient) => setPatientToDelete(patient),
  });

  const handleDelete = async () => {
    if (!patientToDelete) return;
    try {
      setIsSubmitting(true);
      await PatientService.deletePatient(patientToDelete.id);
      toast.success("Đã xóa thông tin bệnh nhân");
      setPatientToDelete(null);
      fetchData();
    } catch (error: unknown) {
      toast.error("Lỗi khi xóa bệnh nhân");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    patients,
    isLoading,
    isSubmitting,
    table,
    columns,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    showAddDialog,
    setShowAddDialog,
    editingPatient,
    patientToDelete,
    setPatientToDelete,
    handleDelete,
    handleRefresh: fetchData,
  };
}
