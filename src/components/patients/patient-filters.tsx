"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientFiltersProps {
  riskLevel?: string;
  gender?: string;
  ageRange?: string;
  onRiskLevelChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onAgeRangeChange: (value: string) => void;
  onClear: () => void;
}

export function PatientFilters({
  riskLevel,
  gender,
  ageRange,
  onRiskLevelChange,
  onGenderChange,
  onAgeRangeChange,
  onClear,
}: PatientFiltersProps) {
  const hasFilters = riskLevel || gender || ageRange;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Mức độ rủi ro</Label>
            <Select value={riskLevel || "all"} onValueChange={onRiskLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Cao">Cao</SelectItem>
                <SelectItem value="Trung bình">Trung bình</SelectItem>
                <SelectItem value="Thấp">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Giới tính</Label>
            <Select value={gender || "all"} onValueChange={onGenderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Độ tuổi</Label>
            <Select value={ageRange || "all"} onValueChange={onAgeRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="0-18">0-18 tuổi</SelectItem>
                <SelectItem value="19-35">19-35 tuổi</SelectItem>
                <SelectItem value="36-50">36-50 tuổi</SelectItem>
                <SelectItem value="51-65">51-65 tuổi</SelectItem>
                <SelectItem value="65+">Trên 65 tuổi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
