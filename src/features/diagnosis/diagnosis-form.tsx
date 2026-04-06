"use client";

import { useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setImagePreview,
  setPredictionResult,
  setMultimodalResult,
} from "@/store/slices/diagnosisSlice";
import { AiService } from "@/services/ai-service";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Activity, FileImage, Stethoscope, AlertTriangle, Check, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

const RISKS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: "NGUY CƠ THẤP", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  MEDIUM: { label: "NGUY CƠ TRUNG BÌNH", color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
  HIGH: { label: "NGUY CƠ CAO", color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
  Unknown: { label: "CHƯA XÁC ĐỊNH", color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200" }
};

const SYMPTOM_LABELS: Record<string, string> = {
  chills: "Rét run",
  fatigue: "Mệt mỏi",
  cough: "Ho",
  high_fever: "Sốt cao",
  breathlessness: "Khó thở",
  phlegm: "Đờm",
  chest_pain: "Đau ngực",
  fast_heart_rate: "Nhịp tim nhanh",
  rusty_sputum: "Đờm màu gỉ sắt",
  malaise: "Uể oải"
};


const PREDICTION_MAP: Record<string, string> = {
  PNEUMONIA: "VIÊM PHỔI",
  "Pneumonia Likely (Imaging Pattern Detected)": "CÓ DẤU HIỆU VIÊM PHỔI",
  NORMAL: "BÌNH THƯỜNG",
};

const getScoreColor = (score: number) => {
  if (score > 0.7) return "bg-red-500";
  if (score > 0.4) return "bg-amber-500";
  return "bg-emerald-500";
};


export function DiagnosisForm() {
  const dispatch = useAppDispatch();
  const diagnosisData = useAppSelector((state) => state.diagnosis);
  const [isSubmittingFusion, setIsSubmittingFusion] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const symptoms = await AiService.getSymptoms();
        setAvailableSymptoms(symptoms);
      } catch (error) {
        console.error("Failed to fetch symptoms", error);
        toast.error("Không thể tải danh sách triệu chứng từ AI");
      }
    };
    fetchSymptoms();
  }, []);


  // Image Upload Logic
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      dispatch(setImagePreview(objectUrl));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".dcm"],
    },
    maxFiles: 1,
  });

  const handleMultimodalSubmit = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng tải lên ảnh X-quang để phân tích");
      return;
    }

    try {
      setIsSubmittingFusion(true);
      const symptomsStr = selectedSymptoms.join(",");
      const result = await AiService.predictMultimodal(selectedFile, symptomsStr);
      console.log("Multimodal AI Result:", result);
      toast.success("Phân tích đa phương thức thành công!");
      dispatch(setMultimodalResult(result));
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi phân tích đa phương thức");
    } finally {
      setIsSubmittingFusion(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Chẩn đoán đa phương thức"
        icon={Activity}
        description="Kết hợp hình ảnh X-quang và triệu chứng lâm sàng để chẩn đoán chính xác"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Image Diagnosis */}
        <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
          <CardHeader className="bg-muted/30 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Chẩn đoán hình ảnh</CardTitle>
                <CardDescription>Phân tích X-quang phổi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1 flex flex-col">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer 
                  transition-all duration-200 ease-in-out h-64 flex flex-col justify-center items-center
                  ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                `}
              >
                <input {...getInputProps()} />
                {diagnosisData.imagePreview ? (
                  <div className="space-y-4 w-full h-full flex flex-col items-center justify-center">
                    <div className="relative group overflow-hidden rounded-lg border border-slate-200 shadow-sm w-full h-48">
                      <Image
                        src={diagnosisData.imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium truncate">{selectedFile?.name || "Uploaded Image"}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        dispatch(setImagePreview(undefined));
                        dispatch(setPredictionResult(null));
                      }}
                    >
                      Xóa ảnh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {isDragActive ? "Thả file vào đây" : "Tải lên ảnh X-quang"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                        Kéo thả file hoặc click để chọn (JPG, PNG, DICOM)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Symptoms and Multimodal Action */}
        <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
          <CardHeader className="bg-muted/30 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Triệu chứng & Lâm sàng</CardTitle>
                <CardDescription>Chọn các triệu chứng để phân tích tổng hợp</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="bg-muted/20 p-4 rounded-xl border border-border">
                <Label className="text-sm font-semibold text-foreground/80 mb-3 block">Chọn các triệu chứng hiện tại</Label>
                {availableSymptoms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSymptoms.map((symptom) => (
                      <div key={symptom} className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={`symptom-${symptom}`}
                          checked={selectedSymptoms.includes(symptom)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSymptoms([...selectedSymptoms, symptom]);
                            } else {
                              setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
                            }
                          }}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <div className="space-y-1 leading-none">
                          <label htmlFor={`symptom-${symptom}`} className="text-sm font-medium cursor-pointer">
                            {SYMPTOM_LABELS[symptom] || symptom}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải danh sách triệu chứng...
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6">
                <Button
                  onClick={handleMultimodalSubmit}
                  className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 h-12 rounded-xl shadow-lg shadow-primary/20 transition-all font-semibold"
                  disabled={isSubmittingFusion || !selectedFile}
                >
                  {isSubmittingFusion ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang phân tích tổng hợp...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-5 w-5" />
                      Chẩn đoán đa phương thức
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multimodal Results Section - Heatmap and Probabilities */}
      {diagnosisData.multimodalResult && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Kết quả Chẩn đoán Đa phương thức</CardTitle>
                    <CardDescription>Phân tích kết hợp Hình ảnh & Triệu chứng</CardDescription>
                  </div>
                </div>
                <Badge
                  className={`px-4 py-1.5 text-base font-bold shadow-sm ${(RISKS_MAP[diagnosisData.multimodalResult.risk_level] || RISKS_MAP.Unknown).bg
                    } ${(RISKS_MAP[diagnosisData.multimodalResult.risk_level] || RISKS_MAP.Unknown).color
                    } ${(RISKS_MAP[diagnosisData.multimodalResult.risk_level] || RISKS_MAP.Unknown).border
                    }`}
                >
                  {(RISKS_MAP[diagnosisData.multimodalResult.risk_level] || RISKS_MAP.Unknown).label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Heatmap Visualization */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-primary" /> Hình ảnh Heatmap (Grad-CAM)
                  </h4>
                  <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-border shadow-inner bg-slate-100 flex items-center justify-center">
                    {(diagnosisData.multimodalResult?.heatmap || diagnosisData.imagePreview) ? (
                      <>
                        <img
                          src={diagnosisData.multimodalResult?.heatmap
                            ? (diagnosisData.multimodalResult.heatmap.startsWith('data:')
                              ? diagnosisData.multimodalResult.heatmap
                              : `data:image/jpeg;base64,${diagnosisData.multimodalResult.heatmap}`)
                            : diagnosisData.imagePreview}
                          alt="AI Heatmap Analysis"
                          className="object-contain w-full h-full"
                        />
                        {diagnosisData.multimodalResult?.heatmap && (
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full border border-white/20">
                            Vùng tổn thương được AI nhận diện
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <FileImage className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm text-muted-foreground">Không có dữ liệu hình ảnh</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center italic">
                    Vùng màu đỏ/vàng biểu thị xác suất tổn thương cao được AI nhận diện
                  </p>
                </div>

                {/* Probabilities and Insights */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" /> Phân bổ xác suất
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Vision Probability */}
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-foreground">Xác suất Hình ảnh (Vision AI)</span>
                          <span className="text-sm font-bold text-primary">{(diagnosisData.multimodalResult.vision_probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreColor(diagnosisData.multimodalResult.vision_probability)}`}
                            style={{ width: `${diagnosisData.multimodalResult.vision_probability * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Clinical Probability */}
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-foreground">Xác suất Lâm sàng (Clinical AI)</span>
                          <span className="text-sm font-bold text-primary">{(diagnosisData.multimodalResult.clinical_probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreColor(diagnosisData.multimodalResult.clinical_probability)}`}
                            style={{ width: `${diagnosisData.multimodalResult.clinical_probability * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Final Combined Score */}
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 shadow-sm ring-1 ring-primary/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-primary">Điểm số Tổng hợp (Multimodal)</span>
                          <span className="text-sm font-extrabold text-primary">{(diagnosisData.multimodalResult.final_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreColor(diagnosisData.multimodalResult.final_score)}`}
                            style={{ width: `${diagnosisData.multimodalResult.final_score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-5 space-y-3 shadow-sm">
                    <h5 className="text-blue-900 dark:text-blue-300 font-semibold flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 text-blue-500" /> Nhận định lâm sàng
                    </h5>
                    <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                      Dựa trên phân tích kết hợp giữa hình ảnh X-quang và bộ {selectedSymptoms.length} triệu chứng được chọn,
                      hệ thống đánh giá mức độ rủi ro viêm phổi là <strong className="uppercase">{RISKS_MAP[diagnosisData.multimodalResult.risk_level]?.label}</strong>.
                    </p>
                    <div className="pt-2">
                      <p className="text-xs text-blue-700 dark:text-blue-500 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Triệu chứng ghi nhận: {selectedSymptoms.map(s => SYMPTOM_LABELS[s] || s).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-500 italic">
                      Đây là kết quả phân tích tham khảo từ AI. Bác sĩ cần đối chiếu với các kết quả xét nghiệm khác và tình trạng thực tế của bệnh nhân để đưa ra quyết định cuối cùng.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
