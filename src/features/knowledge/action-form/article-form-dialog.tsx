"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Article } from "@/types/article";
import { ArticleService } from "@/services/article-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MODAL_STYLES, FORM_STYLES } from "@/constants/styles";

const categoryLabels: Record<string, string> = {
  diagnosis: "Hướng dẫn chẩn đoán",
  lab: "Cận lâm sàng",
  research: "Nghiên cứu & AI",
};

const articleFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().min(1, "Mô tả ngắn không được để trống"),
  content: z.string().min(1, "Nội dung chi tiết không được để trống"),
  author: z.string().min(1, "Tên tác giả không được để trống"),
  readTime: z.string().min(1, "Thời gian đọc không được để trống (VD: 5 phút)"),
  image: z.string().url("Đường dẫn hình ảnh không hợp lệ").or(z.string().min(1, "Đường dẫn hình ảnh không được để trống")),
  tags: z.string().optional().default(""),
  isFeatured: z.boolean().default(false),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null;
  onSuccess?: () => void;
}

export function ArticleFormDialog({
  open,
  onOpenChange,
  article,
  onSuccess,
}: Readonly<ArticleFormDialogProps>) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      category: "diagnosis",
      description: "",
      content: "",
      author: "",
      readTime: "",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
      tags: "",
      isFeatured: false,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const imageUrl = await ArticleService.uploadArticleImage(file);
      form.setValue("image", imageUrl);
      toast.success("Tải ảnh lên thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi tải ảnh lên Cloudinary";
      toast.error(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset({
        title: article?.title ?? "",
        category: article?.category ?? "diagnosis",
        description: article?.description ?? "",
        content: article?.content ?? "",
        author: article?.author ?? "",
        readTime: article?.readTime ?? "",
        image: article?.image ?? "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
        tags: article?.tags ?? "",
        isFeatured: article?.isFeatured ?? false,
      });
    }
  }, [open, article, form]);

  const onSubmit = async (data: ArticleFormValues) => {
    setIsSaving(true);
    try {
      const payload: Partial<Article> = {
        ...data,
        categoryLabel: categoryLabels[data.category] || "Tài liệu",
        date: article?.date ?? new Date().toISOString().split("T")[0],
      };

      if (article && article.id) {
        await ArticleService.updateArticle(article.id, payload);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await ArticleService.createArticle(payload);
        toast.success("Thêm bài viết mới thành công!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_STYLES.contentWide}>
        <DialogHeader className={MODAL_STYLES.header}>
          <DialogTitle className={MODAL_STYLES.title}>
            {article ? "Cập nhật bài viết" : "Thêm bài viết mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={MODAL_STYLES.bodyWithScroll + " gap-6"}
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={FORM_STYLES.label}>
                    Tiêu đề bài viết <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tiêu đề phác đồ hoặc nghiên cứu..."
                      {...field}
                      className={FORM_STYLES.inputBold}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grid 2 cols for Category & Author */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={FORM_STYLES.label}>
                      Danh mục <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={FORM_STYLES.input}>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="diagnosis">Hướng dẫn chẩn đoán</SelectItem>
                        <SelectItem value="lab">Cận lâm sàng</SelectItem>
                        <SelectItem value="research">Nghiên cứu & AI</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author */}
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={FORM_STYLES.label}>
                      Tác giả / Nguồn <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bộ Y tế / Tên bác sĩ..."
                        {...field}
                        className={FORM_STYLES.input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Grid 2 cols for ReadTime & Tags */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Read Time */}
              <FormField
                control={form.control}
                name="readTime"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={FORM_STYLES.label}>
                      Thời gian đọc <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="8 phút, 15 phút..."
                        {...field}
                        className={FORM_STYLES.input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={FORM_STYLES.label}>Từ khóa (Tags)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="WHO, Nhi khoa, Kháng sinh..."
                        {...field}
                        className={FORM_STYLES.input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload Area */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={FORM_STYLES.label}>
                    Hình ảnh bài viết <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {field.value ? (
                        <div className="relative group rounded-xl overflow-hidden border border-border/80 aspect-[21/9] bg-muted/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={field.value}
                            alt="Ảnh bài viết"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 rounded-lg text-xs"
                              onClick={() => field.onChange("")}
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> Xóa ảnh
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`relative border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-muted/5 cursor-pointer min-h-[140px] ${
                            isUploadingImage ? "pointer-events-none opacity-60" : ""
                          }`}
                          onClick={() => document.getElementById("article-image-upload")?.click()}
                        >
                          <input
                            type="file"
                            id="article-image-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="text-xs font-semibold text-muted-foreground animate-pulse">
                                Đang tải ảnh lên Cloudinary...
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-xs font-bold text-foreground">
                                Click để chọn ảnh tải lên
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Hỗ trợ JPEG, PNG, WEBP tối đa 5MB
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={FORM_STYLES.label}>
                    Mô tả ngắn <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                      {...field}
                      className="min-h-[80px] resize-y text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={FORM_STYLES.label}>
                    Nội dung chi tiết <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung phác đồ chi tiết..."
                      {...field}
                      className="min-h-[200px] resize-y text-sm font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Switch Featured */}
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/50 p-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold text-foreground">
                      Bài viết nổi bật (Featured)
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Đưa bài viết này lên vị trí tiêu điểm trên giao diện chính.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Footer Buttons */}
            <div className={MODAL_STYLES.footer + " -mx-6 -mb-5 mt-1"}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={FORM_STYLES.buttonSecondary}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className={FORM_STYLES.buttonPrimary}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Đang lưu..." : article ? "Cập nhật" : "Lưu bài viết"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
