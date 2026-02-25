"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  riskScore: number; // 0-100
  riskLevel: "Cao" | "Trung bình" | "Thấp";
  label?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskGauge({
  riskScore,
  riskLevel,
  label = "Nguy cơ",
  showIcon = true,
  size = "md",
}: RiskGaugeProps) {
  const getRiskColor = () => {
    if (riskScore >= 70) return "text-destructive";
    if (riskScore >= 40) return "text-warning";
    return "text-success";
  };

  const getRiskBgColor = () => {
    if (riskScore >= 70) return "bg-destructive/10";
    if (riskScore >= 40) return "bg-warning/10";
    return "bg-success/10";
  };

  const getRiskBadgeVariant = (): "destructive" | "secondary" | "default" => {
    if (riskScore >= 70) return "destructive";
    if (riskScore >= 40) return "secondary";
    return "default";
  };

  const getIcon = () => {
    if (riskScore >= 70) return AlertTriangle;
    if (riskScore >= 40) return AlertCircle;
    return CheckCircle2;
  };

  const Icon = getIcon();

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <Card className={cn("overflow-hidden", getRiskBgColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          {showIcon && (
            <Icon className={cn("h-5 w-5", getRiskColor())} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <span className={cn("font-bold", sizeClasses[size], getRiskColor())}>
            {riskScore}%
          </span>
          <Badge variant={getRiskBadgeVariant()} className="mb-1">
            {riskLevel}
          </Badge>
        </div>
        <Progress value={riskScore} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Thấp</span>
          <span>Trung bình</span>
          <span>Cao</span>
        </div>
      </CardContent>
    </Card>
  );
}
