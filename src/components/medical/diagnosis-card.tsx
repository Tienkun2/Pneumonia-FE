"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "./risk-gauge";
import { VitalSignsCard } from "./vital-signs-card";
import { Calendar, User, FileText, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface DiagnosisCardProps {
  id: string;
  patientName: string;
  date: string;
  overallRisk: number;
  riskLevel: "Cao" | "Trung bình" | "Thấp";
  imageRisk?: number;
  clinicalRisk?: number;
  findings?: string;
  vitals?: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    oxygenSaturation?: number;
  };
  showVitals?: boolean;
  compact?: boolean;
}

export function DiagnosisCard({
  id,
  patientName,
  date,
  overallRisk,
  riskLevel,
  imageRisk,
  clinicalRisk,
  findings,
  vitals,
  showVitals = false,
  compact = false,
}: DiagnosisCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Chẩn đoán #{id.slice(-6)}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {patientName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(date, "DD/MM/YYYY HH:mm")}
              </div>
            </div>
          </div>
          <Link href={`/results/${id}`}>
            <Button variant="outline" size="sm">
              Chi tiết
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Assessment */}
        <div className={compact ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-4 md:grid-cols-3"}>
          <RiskGauge
            riskScore={overallRisk}
            riskLevel={riskLevel}
            label="Nguy cơ tổng thể"
            size={compact ? "sm" : "md"}
          />
          {imageRisk !== undefined && (
            <RiskGauge
              riskScore={imageRisk}
              riskLevel={
                imageRisk >= 70 ? "Cao" : imageRisk >= 40 ? "Trung bình" : "Thấp"
              }
              label="Nguy cơ từ hình ảnh"
              size={compact ? "sm" : "md"}
            />
          )}
          {clinicalRisk !== undefined && (
            <RiskGauge
              riskScore={clinicalRisk}
              riskLevel={
                clinicalRisk >= 70
                  ? "Cao"
                  : clinicalRisk >= 40
                    ? "Trung bình"
                    : "Thấp"
              }
              label="Nguy cơ từ lâm sàng"
              size={compact ? "sm" : "md"}
            />
          )}
        </div>

        {/* Findings Preview */}
        {findings && !compact && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 text-sm font-semibold">Phát hiện chính:</h4>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {findings}
            </p>
          </div>
        )}

        {/* Vital Signs */}
        {showVitals && vitals && <VitalSignsCard vitals={vitals} />}
      </CardContent>
    </Card>
  );
}
