"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { History, X, Loader2, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Visit } from "@/types/diagnosis";
import { Patient } from "@/types/patient";

interface HistoryPanelProps {
  selectedPatient: Patient;
  isLoadingVisits: boolean;
  patientVisits: Visit[];
  onClose: () => void;
}

export function HistoryPanel({ 
  selectedPatient, 
  isLoadingVisits, 
  patientVisits, 
  onClose 
}: HistoryPanelProps) {
  return (
    <Card className="animate-in slide-in-from-top-4 duration-500 overflow-hidden border-border/60 shadow-xl bg-card/80 backdrop-blur-xl">
      <CardHeader className="bg-muted/40 border-b border-border/40 flex flex-row items-center justify-between px-5 py-3">
        <CardTitle className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> Nhật ký chẩn đoán — {selectedPatient.fullName}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoadingVisits ? (
          <div className="col-span-full py-10 text-center">
            <Loader2 className="h-7 w-7 animate-spin mx-auto text-primary/30" />
          </div>
        ) : patientVisits.length > 0 ? (
          patientVisits.map((visit) => (
            <div 
              key={visit.id} 
              className="p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/30 hover:bg-card/60 transition-all cursor-default group"
            >
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {format(new Date(visit.visitDate), "dd/MM/yyyy", { locale: vi })}
                  </span>
                </div>
                {visit.diagnoses?.[0] && (
                  <Badge className={cn(
                    "text-[9px] font-black uppercase px-2 shadow-none border-none", 
                    visit.diagnoses[0].result === "PNEUMONIA" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {visit.diagnoses[0].result === "PNEUMONIA" ? "Viêm phổi" : "Bình thường"}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 line-clamp-2 italic leading-relaxed transition-colors">
                &ldquo;{visit.symptoms || "—"}&rdquo;
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-muted-foreground/40 font-medium italic text-sm">
            Chưa có lịch sử khám
          </div>
        )}
      </CardContent>
    </Card>
  );
}
