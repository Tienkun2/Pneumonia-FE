"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickAddPatientDialog } from "@/components/patients/quick-add-patient-dialog";
import { PatientFilters } from "@/components/patients/patient-filters";
import { Search, Plus, Eye, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Mock data
const mockPatients = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    age: 3,
    gender: "male",
    phone: "0901234567",
    address: "Hà Nội",
    createdAt: "2024-01-15",
    lastDiagnosis: "2024-01-20",
    riskLevel: "Cao",
  },
  {
    id: "2",
    name: "Trần Thị B",
    age: 1,
    gender: "female",
    phone: "0907654321",
    address: "TP.HCM",
    createdAt: "2024-01-10",
    lastDiagnosis: "2024-01-18",
    riskLevel: "Trung bình",
  },
  {
    id: "3",
    name: "Lê Văn C",
    age: 5,
    gender: "male",
    phone: "0912345678",
    address: "Đà Nẵng",
    createdAt: "2024-01-05",
    lastDiagnosis: "2024-01-15",
    riskLevel: "Thấp",
  },
];

export function PatientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState<string>("all");

  let filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  );

  // Apply filters
  if (riskFilter !== "all") {
    filteredPatients = filteredPatients.filter(
      (p) => p.riskLevel === riskFilter
    );
  }
  if (genderFilter !== "all") {
    filteredPatients = filteredPatients.filter(
      (p) => p.gender === genderFilter
    );
  }
  if (ageRangeFilter !== "all") {
    const [min, max] = ageRangeFilter.includes("+")
      ? [65, 200]
      : ageRangeFilter.split("-").map(Number);
    filteredPatients = filteredPatients.filter(
      (p) => p.age >= min && (max ? p.age <= max : true)
    );
  }

  const handleExport = () => {
    // Simulate export
    toast.success("Đang xuất dữ liệu...");
    setTimeout(() => {
      toast.success("Xuất dữ liệu thành công!");
    }, 1000);
  };

  const handleAddSuccess = (patient: any) => {
    toast.success(`Đã thêm bệnh nhi: ${patient.name}`);
    // In real app, refresh patient list
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bệnh nhi</h1>
          <p className="text-muted-foreground">
            Danh sách và thông tin bệnh nhi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất dữ liệu
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm bệnh nhi
          </Button>
        </div>
      </div>

      <PatientFilters
        riskLevel={riskFilter}
        gender={genderFilter}
        ageRange={ageRangeFilter}
        onRiskLevelChange={setRiskFilter}
        onGenderChange={setGenderFilter}
        onAgeRangeChange={setAgeRangeFilter}
        onClear={() => {
          setRiskFilter("all");
          setGenderFilter("all");
          setAgeRangeFilter("all");
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách bệnh nhi</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Tuổi</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Chẩn đoán cuối</TableHead>
                <TableHead>Mức độ rủi ro</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Không tìm thấy bệnh nhi
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>
                      {patient.gender === "male" ? "Nam" : "Nữ"}
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.address}</TableCell>
                    <TableCell>{patient.lastDiagnosis}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                        {patient.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <QuickAddPatientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
