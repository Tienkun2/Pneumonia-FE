"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPatients } from "@/store/slices/patient-slice";
import { fetchPatientVisits } from "@/store/slices/visit-slice";
import { getVisitRisk } from "@/constants/diagnosis";

export function useComparison() {
  const dispatch = useAppDispatch();
  const patients = useAppSelector((state) => state.patient.patients);
  const { visits, isLoading: isVisitsLoading } = useAppSelector((state) => state.visit);
  const { totalPages, isLoading: isPatientsLoading } = useAppSelector((state) => state.patient);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [visitAId, setVisitAId] = useState<string>("");
  const [visitBId, setVisitBId] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageRef = useRef(page);

  // 1. Sync search debounce
  useEffect(() => { pageRef.current = page; }, [page]);
  
  useEffect(() => {
    const t = setTimeout(() => { 
      setDebouncedSearch(search); 
      setPage(1); 
    }, 500);
    return () => clearTimeout(t);
  }, [search]);
  
  // 2. Fetch Patients
  useEffect(() => {
    dispatch(fetchPatients({ page, size: 10, filters: { search: debouncedSearch } }));
  }, [dispatch, page, debouncedSearch]);

  // 3. Fetch Patient Visits
  useEffect(() => {
    if (selectedPatientId) {
      dispatch(fetchPatientVisits(selectedPatientId));
      setVisitAId(""); 
      setVisitBId(""); 
      setIsComparing(false);
    }
  }, [selectedPatientId, dispatch]);

  const visitA = useMemo(() => visits.find((v) => v.id === visitAId), [visits, visitAId]);
  const visitB = useMemo(() => visits.find((v) => v.id === visitBId), [visits, visitBId]);

  const sortedVisits = useMemo(() => {
    if (!visitA || !visitB) return { first: visitA, second: visitB };
    const dateA = new Date(visitA.visitDate).getTime();
    const dateB = new Date(visitB.visitDate).getTime();
    return dateA <= dateB ? { first: visitA, second: visitB } : { first: visitB, second: visitA };
  }, [visitA, visitB]);

  const riskFirst = getVisitRisk(sortedVisits.first);
  const riskSecond = getVisitRisk(sortedVisits.second);
  const delta = riskSecond - riskFirst;
  const improving = delta <= 0;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (isPatientsLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pageRef.current < totalPages) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [isPatientsLoading, totalPages]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const canCompare = !!visitAId && !!visitBId;

  return {
    // State
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
    
    // Computed
    sortedVisits,
    riskFirst,
    riskSecond,
    delta,
    improving,
    
    // Refs
    lastItemRef,
  };
}
