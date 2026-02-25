"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Thermometer, Gauge, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalSign {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: "normal" | "warning" | "critical";
}

interface VitalSignsCardProps {
  vitals: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    oxygenSaturation?: number;
  };
}

export function VitalSignsCard({ vitals }: VitalSignsCardProps) {
  const vitalSigns: VitalSign[] = [
    {
      label: "Nhiệt độ",
      value: vitals.temperature ?? "-",
      unit: "°C",
      icon: Thermometer,
      status: vitals.temperature
        ? vitals.temperature > 37.5 || vitals.temperature < 36.5
          ? "warning"
          : "normal"
        : undefined,
    },
    {
      label: "Nhịp tim",
      value: vitals.heartRate ?? "-",
      unit: "bpm",
      icon: Heart,
      status: vitals.heartRate
        ? vitals.heartRate > 100 || vitals.heartRate < 60
          ? "warning"
          : "normal"
        : undefined,
    },
    {
      label: "Huyết áp",
      value: vitals.bloodPressure ?? "-",
      unit: "",
      icon: Gauge,
      status: vitals.bloodPressure ? "normal" : undefined,
    },
    {
      label: "SpO2",
      value: vitals.oxygenSaturation ?? "-",
      unit: "%",
      icon: Activity,
      status: vitals.oxygenSaturation
        ? vitals.oxygenSaturation < 95
          ? "critical"
          : "normal"
        : undefined,
    },
  ];

  const getStatusColor = (status?: "normal" | "warning" | "critical") => {
    switch (status) {
      case "critical":
        return "text-destructive";
      case "warning":
        return "text-warning";
      case "normal":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dấu hiệu sinh tồn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {vitalSigns.map((vital, idx) => {
            const Icon = vital.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center space-y-2 rounded-lg border p-4"
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    getStatusColor(vital.status)
                  )}
                />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{vital.label}</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      getStatusColor(vital.status)
                    )}
                  >
                    {vital.value}
                    {vital.value !== "-" && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        {vital.unit}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
