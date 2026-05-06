"use client";

import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";
import { RefObject } from "react";

interface PatientSelectorProps {
  selectedPatient: Patient | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  patients: Patient[];
  isSearching: boolean;
  setSelectedPatient: (patient: Patient | null) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  dropdownRef: RefObject<HTMLDivElement>;
  lastPatientElementRef: (node: HTMLElement | null) => void;
}

export function PatientSelector({
  selectedPatient,
  searchQuery,
  setSearchQuery,
  isDropdownOpen,
  setIsDropdownOpen,
  patients,
  isSearching,
  setSelectedPatient,
  showHistory,
  setShowHistory,
  dropdownRef,
  lastPatientElementRef
}: PatientSelectorProps) {
  return (
    <div className="relative flex items-center min-w-[300px]" ref={dropdownRef}>
      {selectedPatient ? (
        <div className="flex items-center justify-between w-full bg-card border border-border/60 rounded-xl px-3 py-2 shadow-sm animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[11px] font-black">
              {selectedPatient.fullName.charAt(0)}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">{selectedPatient.fullName}</p>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{selectedPatient.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className={cn("h-7 w-7 rounded-md", showHistory ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <X className={cn("h-3.5 w-3.5", !showHistory && "hidden")} />
              <Search className={cn("h-3.5 w-3.5", showHistory && "hidden")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPatient(null)}
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
          <Input
            placeholder="Tìm bệnh nhân (mã hoặc tên)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            className="pl-9 h-10 border-border/60 rounded-xl bg-card focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/40 text-sm font-medium placeholder:text-muted-foreground/40 w-full shadow-sm"
          />
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-full bg-popover border border-border shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="p-2 border-b border-border/40 bg-muted/40">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2">Kết quả tìm kiếm</p>
              </div>
              <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                {patients.map((patient, index) => (
                  <button
                    key={patient.id}
                    ref={index === patients.length - 1 ? lastPatientElementRef : null}
                    onClick={() => { setSelectedPatient(patient); setIsDropdownOpen(false); setSearchQuery(""); }}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center justify-between border-b border-border/40 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{patient.fullName}</p>
                      <p className="text-xs font-semibold text-muted-foreground/70 uppercase">{patient.code} • {patient.phone}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold h-5 border-border/60 bg-muted/30">
                      {patient.gender === "MALE" ? "NAM" : "NỮ"}
                    </Badge>
                  </button>
                ))}
                {isSearching && <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" /></div>}
                {patients.length === 0 && !isSearching && (
                  <div className="p-6 text-center text-sm text-muted-foreground font-medium italic">Không tìm thấy bệnh nhân</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
