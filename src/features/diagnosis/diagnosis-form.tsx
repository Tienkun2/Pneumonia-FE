"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setImagePreview,
  setPredictionResult,
  setClinicalData,
  setClinicalPredictionResult,
  setFusionResult,
} from "@/store/slices/diagnosisSlice";
import { AiService } from "@/services/ai-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Activity, FileImage, Stethoscope, AlertTriangle, Check, BrainCircuit } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const RISKS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Low: { label: "NGUY CƠ THẤP", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
  Moderate: { label: "NGUY CƠ TRUNG BÌNH", color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-200" },
  Severe: { label: "NGUY CƠ CAO", color: "text-red-700", bg: "bg-red-100", border: "border-red-200" },
};

const PREDICTION_MAP: Record<string, string> = {
  PNEUMONIA: "VIÊM PHỔI",
  "Pneumonia Likely (Imaging Pattern Detected)": "CÓ DẤU HIỆU VIÊM PHỔI",
  NORMAL: "BÌNH THƯỜNG",
};

const clinicalSchema = z.object({
  age_months: z.coerce.number().min(1, "Tuổi (tháng) phải từ 1 trở lên").max(59, "Tuổi phải dưới 60 tháng (5 tuổi)"),
  respiratory_rate: z.coerce.number().min(0, "Nhịp thở không hợp lệ"),
  spO2: z.coerce.number().min(0).max(100, "SpO2 phải từ 0-100"),
  cough: z.boolean().default(false),
  fever: z.boolean().default(false),
  chest_indrawing: z.boolean().default(false),
  danger_sign: z.boolean().default(false),
  feeding_difficulty: z.boolean().default(false),
});

export function DiagnosisForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const diagnosisData = useAppSelector((state) => state.diagnosis);
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);
  const [isSubmittingClinical, setIsSubmittingClinical] = useState(false);
  const [isSubmittingFusion, setIsSubmittingFusion] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleImageSubmit = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng tải lên ảnh X-quang để phân tích");
      return;
    }

    try {
      setIsSubmittingImage(true);
      const result = await AiService.predictPneumonia(selectedFile);
      console.log("Image AI Result:", result);
      toast.success("Phân tích hình ảnh thành công!");
      dispatch(setPredictionResult(result));
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi phân tích hình ảnh");
    } finally {
      setIsSubmittingImage(false);
    }
  };

  // Clinical Form Logic
  const form = useForm<z.infer<typeof clinicalSchema>>({
    resolver: zodResolver(clinicalSchema),
    defaultValues: diagnosisData.clinicalData || {
      age_months: 12,
      respiratory_rate: 30,
      spO2: 98,
      cough: false,
      fever: false,
      chest_indrawing: false,
      danger_sign: false,
      feeding_difficulty: false,
    },
  });

  const onClinicalSubmit = async (values: z.infer<typeof clinicalSchema>) => {
    try {
      setIsSubmittingClinical(true);
      dispatch(setClinicalData(values));
      const result = await AiService.predictClinical(values);
      console.log("Clinical AI Result:", result);
      toast.success("Chẩn đoán lâm sàng thành công!");
      dispatch(setClinicalPredictionResult(result));
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi chẩn đoán lâm sàng");
    } finally {
      setIsSubmittingClinical(false);
    }
  };

  const handleFusionSubmit = async () => {
    if (!diagnosisData.predictionResult || !diagnosisData.clinicalPredictionResult) {
      toast.error("Cần có kết quả từ cả Hình ảnh và Lâm sàng để tổng hợp!");
      return;
    }

    try {
      setIsSubmittingFusion(true);
      const result = await AiService.predictFusion({
        xray_result: diagnosisData.predictionResult,
        clinical_result: diagnosisData.clinicalPredictionResult,
      });
      console.log("Fusion Result:", result);
      toast.success("Tổng hợp kết quả thành công!");
      dispatch(setFusionResult(result));
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tổng hợp kết quả");
    } finally {
      setIsSubmittingFusion(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Chẩn đoán đa phương thức</h1>
          <p className="text-slate-500 mt-1">
            Kết hợp chẩn đoán hình ảnh X-quang và dấu hiệu lâm sàng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Image Diagnosis */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileImage className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Chẩn đoán hình ảnh</CardTitle>
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
                  ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
                `}
              >
                <input {...getInputProps()} />
                {diagnosisData.imagePreview ? (
                  <div className="space-y-4 w-full h-full flex flex-col items-center justify-center">
                    <div className="relative group overflow-hidden rounded-lg border border-slate-200 shadow-sm w-full h-48">
                      <img
                        src={diagnosisData.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
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
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {isDragActive ? "Thả file vào đây" : "Tải lên ảnh X-quang"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                        Kéo thả file hoặc click để chọn (JPG, PNG, DICOM)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-auto pt-6">
                <Button
                  onClick={handleImageSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all font-medium py-6"
                  disabled={isSubmittingImage || !selectedFile}
                >
                  {isSubmittingImage ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="mr-2 h-5 w-5" />
                      Chẩn đoán hình ảnh
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Image Diagnosis Results Display */}
            {diagnosisData.predictionResult && (
              <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-5 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Kết quả phân tích</h3>
                    <Badge
                      variant={
                        diagnosisData.predictionResult.imaging_assessment.toLowerCase().includes("pneumonia") ? "destructive" : "default"
                      }
                      className={`px-3 py-1 text-sm ${diagnosisData.predictionResult.imaging_assessment.toLowerCase().includes("pneumonia")
                        ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        }`}
                    >
                      {PREDICTION_MAP[diagnosisData.predictionResult.imaging_assessment] || diagnosisData.predictionResult.imaging_assessment}
                    </Badge>
                  </div>


                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Độ tin cậy (Confidence)</span>
                      <span className="text-lg font-bold text-slate-900">
                        {diagnosisData.predictionResult.confidence_level}
                      </span>
                    </div>
                    {/* Progress bar using probability_score */}
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${diagnosisData.predictionResult.imaging_assessment.toLowerCase().includes("pneumonia")
                          ? "bg-red-600"
                          : "bg-emerald-600"
                          }`}
                        style={{ width: `${diagnosisData.predictionResult.probability_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Kết luận AI</p>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {diagnosisData.predictionResult.explanation_vi || diagnosisData.predictionResult.explanation_en}
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer for Image */}
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-yellow-800 italic">
                      {diagnosisData.predictionResult.disclaimer_vi || diagnosisData.predictionResult.disclaimer_en}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Clinical Diagnosis */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Chẩn đoán lâm sàng</CardTitle>
                <CardDescription>Dựa trên triệu chứng & chỉ số sinh tồn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onClinicalSubmit)} className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="age_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tuổi (tháng)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="focus-visible:ring-emerald-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="respiratory_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhịp thở (lần/phút)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="focus-visible:ring-emerald-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spO2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SpO2 (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="focus-visible:ring-emerald-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Triệu chứng & Dấu hiệu</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {[
                      { name: "cough", label: "Ho (Cough)" },
                      { name: "fever", label: "Sốt (Fever)" },
                      { name: "chest_indrawing", label: "Rút lõm lồng ngực" },
                      { name: "danger_sign", label: "Dấu hiệu nguy hiểm" },
                      { name: "feeding_difficulty", label: "Bú kém / bỏ bú" },
                    ].map((item) => (
                      <FormField
                        key={item.name}
                        control={form.control}
                        name={item.name as keyof typeof clinicalSchema.shape}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 hover:bg-white transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={Boolean(field.value)}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">
                                {item.label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all font-medium py-6"
                    disabled={isSubmittingClinical}
                  >
                    {isSubmittingClinical ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang chẩn đoán...
                      </>
                    ) : (
                      <>
                        <Activity className="mr-2 h-5 w-5" />
                        Chẩn đoán lâm sàng
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Clinical Results Display */}
            {diagnosisData.clinicalPredictionResult && (
              <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-5 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Kết quả phân tích</h3>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-sm ${diagnosisData.clinicalPredictionResult.severity_level ? (RISKS_MAP[diagnosisData.clinicalPredictionResult.severity_level]?.bg || "bg-gray-100") : "bg-gray-100"} ${diagnosisData.clinicalPredictionResult.severity_level ? (RISKS_MAP[diagnosisData.clinicalPredictionResult.severity_level]?.color || "text-gray-700") : "text-gray-700"} ${diagnosisData.clinicalPredictionResult.severity_level ? (RISKS_MAP[diagnosisData.clinicalPredictionResult.severity_level]?.border || "border-gray-200") : "border-gray-200"}`}
                    >
                      {diagnosisData.clinicalPredictionResult.severity_level
                        ? (RISKS_MAP[diagnosisData.clinicalPredictionResult.severity_level]?.label || diagnosisData.clinicalPredictionResult.severity_level.toUpperCase())
                        : "CHƯA XÁC ĐỊNH"}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {diagnosisData.clinicalPredictionResult.probability_distribution ? (
                        Object.entries(diagnosisData.clinicalPredictionResult.probability_distribution).map(([level, prob]) => {
                          const vietnameseLabel = level === "Low" ? "Thấp" : level === "Moderate" ? "Trung bình" : "Cao";
                          return (
                            <div key={level} className="flex flex-col">
                              <span className="text-xs text-slate-500 uppercase font-medium">{vietnameseLabel}</span>
                              <span className={`text-sm font-bold ${level === "Severe" ? "text-red-600" :
                                level === "Moderate" ? "text-yellow-600" : "text-emerald-600"
                                }`}>
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-3 text-sm text-slate-500 italic">Không có dữ liệu xác suất</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Khuyến nghị điều trị</p>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {diagnosisData.clinicalPredictionResult.guidance_vi || diagnosisData.clinicalPredictionResult.guidance_en}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="p-1 bg-slate-100 rounded-full mt-0.5">
                      <Activity className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Giải thích & Lý do</p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {diagnosisData.clinicalPredictionResult.reasoning_vi || diagnosisData.clinicalPredictionResult.reasoning_en}
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer for Clinical */}
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-yellow-800 italic">
                      {diagnosisData.clinicalPredictionResult.disclaimer_vi || diagnosisData.clinicalPredictionResult.disclaimer_en}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {/* Fusion Diagnosis Section - Full Width */}
      {diagnosisData.predictionResult && diagnosisData.clinicalPredictionResult && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          <Card className="border-purple-200 shadow-md bg-purple-50/30">
            <CardHeader className="bg-purple-100/50 border-b border-purple-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <BrainCircuit className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-purple-900">Tổng hợp Kết quả & Chẩn đoán</CardTitle>
                  <CardDescription className="text-purple-700">
                    Kết hợp phân tích từ cả Hình ảnh và Lâm sàng để đưa ra kết luận cuối cùng
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {!diagnosisData.fusionResult ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                    Hệ thống đã có đủ dữ liệu từ cả hai nguồn. Nhấn nút bên dưới để tổng hợp và đưa ra đánh giá toàn diện.
                  </p>
                  <Button
                    onClick={handleFusionSubmit}
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 px-8 py-6 text-lg font-medium"
                    disabled={isSubmittingFusion}
                  >
                    {isSubmittingFusion ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Đang tổng hợp & phân tích...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="mr-2 h-6 w-6" />
                        Tổng hợp kết quả
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Key Findings */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                        <span className="text-slate-600 font-medium">Đánh giá chung:</span>
                        <span className="text-lg font-bold text-purple-900">{diagnosisData.fusionResult.condition_assessment}</span>
                      </div>

                      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                        <span className="text-slate-600 font-medium">Mức độ nghiêm trọng:</span>
                        <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-base">
                          {diagnosisData.fusionResult.severity_level}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                        <span className="text-slate-600 font-medium">Độ tin cậy hệ thống:</span>
                        <span className="text-purple-700 font-semibold">{diagnosisData.fusionResult.confidence_level}</span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="flex-1 bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Cơ sở lập luận
                      </h4>
                      <ul className="space-y-3">
                        {diagnosisData.fusionResult.fusion_reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" /> Khuyến nghị y tế (WHO Guidelines)
                    </h4>
                    <p className="text-blue-800 leading-relaxed">
                      {diagnosisData.fusionResult.recommendation_vi || diagnosisData.fusionResult.recommendation_en}
                    </p>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-yellow-800 italic">
                      {diagnosisData.fusionResult.disclaimer_vi || diagnosisData.fusionResult.disclaimer_en}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
