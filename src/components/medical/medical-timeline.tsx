"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  riskLevel?: "Cao" | "Trung bình" | "Thấp";
  riskScore?: number;
  type: "diagnosis" | "update" | "note";
}

interface MedicalTimelineProps {
  events: TimelineEvent[];
  patientName?: string;
}

export function MedicalTimeline({ events, patientName }: MedicalTimelineProps) {
  const getRiskBadgeVariant = (
    risk?: "Cao" | "Trung bình" | "Thấp"
  ): "destructive" | "secondary" | "default" => {
    switch (risk) {
      case "Cao":
        return "destructive";
      case "Trung bình":
        return "secondary";
      case "Thấp":
        return "default";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "diagnosis":
        return FileText;
      case "update":
        return Calendar;
      default:
        return FileText;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = getTypeIcon(event.type);
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-5 top-10 h-full w-0.5 bg-border" />
                )}

                {/* Icon */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        {event.riskLevel && (
                          <Badge variant={getRiskBadgeVariant(event.riskLevel)}>
                            {event.riskLevel}
                            {event.riskScore && ` (${event.riskScore}%)`}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(event.date, "DD/MM/YYYY HH:mm")}
                      </p>
                      {event.description && (
                        <p className="mt-2 text-sm">{event.description}</p>
                      )}
                    </div>
                    {event.type === "diagnosis" && (
                      <Link href={`/results/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          Xem chi tiết
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Chưa có lịch sử chẩn đoán
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
