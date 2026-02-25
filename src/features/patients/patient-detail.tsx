"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MedicalTimeline } from "@/components/medical/medical-timeline";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock data
const mockPatient = {
  id: "1",
  name: "Nguyễn Văn A",
  age: 45,
  gender: "male",
  phone: "0901234567",
  address: "123 Đường ABC, Quận XYZ, Hà Nội",
  createdAt: "2024-01-15",
};

const mockDiagnoses = [
  {
    id: "d1",
    date: "2024-01-20",
    riskLevel: "Cao",
    riskScore: 85,
    findings: "Phát hiện dấu hiệu viêm phổi ở thùy dưới phổi phải",
  },
  {
    id: "d2",
    date: "2024-01-15",
    riskLevel: "Trung bình",
    riskScore: 45,
    findings: "Dấu hiệu nhẹ, cần theo dõi thêm",
  },
];

export function PatientDetail({ patientId }: { patientId: string }) {
  const patient = mockPatient;
  const diagnoses = mockDiagnoses;

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "Cao":
        return "destructive";
      case "Trung bình":
        return "secondary";
      case "Thấp":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chi tiết bệnh nhân</h1>
          <p className="text-muted-foreground">
            Thông tin và lịch sử chẩn đoán
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bệnh nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Họ tên</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tuổi</p>
              <p className="font-medium">{patient.age}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giới tính</p>
              <p className="font-medium">
                {patient.gender === "male" ? "Nam" : "Nữ"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="font-medium">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Địa chỉ</p>
              <p className="font-medium">{patient.address}</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <MedicalTimeline
            events={diagnoses.map((d) => ({
              id: d.id,
              date: d.date,
              title: `Chẩn đoán ${d.id.slice(-6)}`,
              description: d.findings,
              riskLevel: d.riskLevel,
              riskScore: d.riskScore,
              type: "diagnosis",
            }))}
            patientName={patient.name}
          />
        </div>
      </div>
    </div>
  );
}
