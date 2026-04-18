"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  setImagePreview, 
  setMultimodalResult, 
  setPredictionResult 
} from "@/store/slices/diagnosis-slice";
import { AiService } from "@/services/ai-service";
import { PatientService } from "@/services/patient-service";
import { VisitService } from "@/services/visit-service";
import { Patient } from "@/types/patient";
import { Visit } from "@/types/diagnosis";
import { toast } from "sonner";
import { SYMPTOM_LABELS } from "@/constants/diagnosis";

export function useDiagnosis() {
  const dispatch = useAppDispatch();
  const diagnosisData = useAppSelector((state) => state.diagnosis);
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get("patientId");

  // Status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSymptomEditing, setIsSymptomEditing] = useState(false);

  // Patient Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVisits, setPatientVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [showHistory, setShowHistory] = useState(false); 

  // Infinite Scroll & Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 1. Initial Data Fetching
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const symptoms = await AiService.getSymptoms();
        setAvailableSymptoms(symptoms);
      } catch {
        toast.error("Không thể tải danh sách triệu chứng từ AI");
      }
    };
    fetchSymptoms();
  }, []);

  // 2. Patient Search & Infinite Scroll
  const fetchPatients = useCallback(async (currentPage: number, qs: string, append = false) => {
    try {
      if (currentPage === 1) setIsSearching(true);
      const data = await PatientService.getPatients(currentPage, 10, { search: qs });
      const newItems = data.data || [];
      setPatients(prev => append ? [...prev, ...newItems] : newItems);
      setHasMore(currentPage < (data.totalPages || 1) && newItems.length > 0);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      if (!append) setPatients([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const delay = searchQuery ? 800 : 0;
    const timer = setTimeout(() => {
      setPage(1);
      fetchPatients(1, searchQuery, false);
    }, delay);
    return () => clearTimeout(timer);
  }, [searchQuery, isDropdownOpen, fetchPatients]);

  useEffect(() => {
    if (!isDropdownOpen || page <= 1) return;
    fetchPatients(page, searchQuery, true);
  }, [page, isDropdownOpen, searchQuery, fetchPatients]);

  const lastPatientElementRef = useCallback((node: HTMLElement | null) => {
    if (isSearching) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { rootMargin: '100px' });
    if (node) observerRef.current.observe(node);
  }, [isSearching, hasMore]);

  // Handle clicking outside to close Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Patient Selection Logic
  useEffect(() => {
    if (patientIdFromUrl && !selectedPatient) {
      const fetchInitialPatient = async () => {
        try {
          const patientData = await PatientService.getPatientById(patientIdFromUrl);
          setSelectedPatient(patientData);
        } catch (error) {
          console.error("Failed to auto-select patient:", error);
        }
      };
      fetchInitialPatient();
    }
  }, [patientIdFromUrl, selectedPatient]);

  useEffect(() => {
    if (selectedPatient) {
      const fetchVisits = async () => {
        try {
          setIsLoadingVisits(true);
          const visits = await VisitService.getPatientVisits(selectedPatient.id);
          setPatientVisits(visits);
        } catch (error) {
          console.error("Failed to fetch visits:", error);
        } finally {
          setIsLoadingVisits(false);
        }
      };
      fetchVisits();
    } else {
      setPatientVisits([]);
      setShowHistory(false);
    }
  }, [selectedPatient]);

  // 4. Analysis Logic
  const handleDrop = (files: File[]) => {
    const file = files[0];
    if (file) {
      setSelectedFile(file);
      dispatch(setImagePreview(URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng tải lên ảnh X-quang để phân tích");
      return;
    }
    try {
      setIsSubmitting(true);
      const result = await AiService.predictMultimodal(selectedFile, selectedSymptoms.join(","));
      dispatch(setMultimodalResult(result));
      toast.success("Phân tích đa phương thức thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi phân tích đa phương thức");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    dispatch(setImagePreview(undefined));
    dispatch(setPredictionResult(null));
    dispatch(setMultimodalResult(null));
  };

  const toggleSymptom = (symptom: string, checked: boolean) => {
    setSelectedSymptoms(prev =>
      checked ? [...prev, symptom] : prev.filter(s => s !== symptom)
    );
  };

  const handleSaveVisit = async () => {
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân trước khi lưu");
      return;
    }

    if (!diagnosisData.multimodalResult) {
      toast.error("Vui lòng thực hiện chẩn đoán trước khi lưu");
      return;
    }

    try {
      setIsSaving(true)
      await VisitService.createMultimodalVisit({
        patientId: selectedPatient.id,
        symptoms: selectedSymptoms.map(s => SYMPTOM_LABELS[s] || s).join(", "),
        note: note,
        imageUrl: diagnosisData.multimodalResult.heatmap || "",
        imageType: "XRAY",
        result: diagnosisData.multimodalResult.risk_level === "HIGH" ? "PNEUMONIA" : "NORMAL",
        confidenceScore: diagnosisData.multimodalResult.final_score,
        modelVersion: "v1.0"
      });

      toast.success("Đã lưu kết quả chẩn đoán vào hồ sơ bệnh nhân!");
      setNote("");
      setSelectedPatient(null);
      setSelectedSymptoms([]);
      setSelectedFile(null);
      setShowHistory(false);
      setIsSymptomEditing(false);
      dispatch(setImagePreview(undefined));
      dispatch(setMultimodalResult(null));
      dispatch(setPredictionResult(null));
      setSearchQuery("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Lỗi khi lưu kết quả chẩn đoán";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // State
    diagnosisData,
    isSubmitting,
    isSaving,
    note,
    setNote,
    selectedFile,
    availableSymptoms,
    selectedSymptoms,
    showOverlay,
    setShowOverlay,
    isSymptomEditing,
    setIsSymptomEditing,
    searchQuery,
    setSearchQuery,
    patients,
    isSearching,
    selectedPatient,
    setSelectedPatient,
    patientVisits,
    isLoadingVisits,
    showHistory,
    setShowHistory,
    isDropdownOpen,
    setIsDropdownOpen,
    hasMore,
    
    // Refs
    dropdownRef,
    lastPatientElementRef,
    
    // Actions
    handleDrop,
    handleSubmit,
    clearImage,
    toggleSymptom,
    handleSaveVisit,
    canSubmit: !!selectedFile && !isSubmitting,
  };
}
