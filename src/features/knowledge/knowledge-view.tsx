"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  Microscope,
  Stethoscope,
  TrendingUp,
  FileText,
  Star,
  Info,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Article } from "@/types/article";
import { ArticleService } from "@/services/article-service";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { ArticleFormDialog } from "./action-form/article-form-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const categories = [
  { id: "all", label: "Tất cả", icon: BookOpen },
  { id: "diagnosis", label: "Hướng dẫn chẩn đoán", icon: Stethoscope },
  { id: "lab", label: "Cận lâm sàng", icon: Microscope },
  { id: "research", label: "Nghiên cứu & AI", icon: TrendingUp },
];

export function KnowledgeView() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dialog states for CRUD
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current user and authorize check
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthorized = user?.roles?.some(
    (role) =>
      role.name === "ADMIN" ||
      role.name === "ROLE_ADMIN" ||
      role.name === "DOCTOR" ||
      role.name === "ROLE_DOCTOR"
  );

  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const handleFormSuccess = () => {
    handleRefresh();
    if (selectedArticle) {
      // Refresh the currently selected article details in view mode
      ArticleService.getArticleById(selectedArticle.id)
        .then((updated) => setSelectedArticle(updated))
        .catch((err) => console.error("Error refreshing detail view", err));
    }
  };

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await ArticleService.deleteArticle(articleToDelete.id);
      toast.success("Xóa bài viết thành công!");
      if (selectedArticle?.id === articleToDelete.id) {
        setSelectedArticle(null);
      }
      setArticleToDelete(null);
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa bài viết";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const data = await ArticleService.getArticles(searchQuery, activeTab);
        setArticles(data);
      } catch (err) {
        console.error("Lỗi khi tải tài liệu từ BE:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab, refreshTrigger]);

  const featuredArticle = articles.find(a => a.isFeatured);

  if (selectedArticle) {
    return (
       <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
             <Button variant="ghost" onClick={() => setSelectedArticle(null)}>
                 Quay lại danh sách
             </Button>
             {isAuthorized && (
                <div className="flex items-center gap-2">
                   <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-semibold text-xs h-9 rounded-lg"
                      onClick={() => {
                         setEditingArticle(selectedArticle);
                         setShowFormDialog(true);
                      }}
                   >
                      <Pencil className="h-3.5 w-3.5" /> Sửa bài viết
                   </Button>
                   <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5 font-semibold text-xs h-9 rounded-lg"
                      onClick={() => setArticleToDelete(selectedArticle)}
                   >
                      <Trash2 className="h-3.5 w-3.5" /> Xóa bài viết
                   </Button>
                </div>
             )}
          </div>
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 relative">
             <Image 
               src={selectedArticle.image} 
               alt={selectedArticle.title} 
               fill
               className="object-cover" 
               unoptimized
             />
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-none">{selectedArticle.categoryLabel}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                   <Clock className="h-3.5 w-3.5" /> {selectedArticle.readTime}
                </span>
             </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">{selectedArticle.title}</h1>
              <div className="flex items-center gap-3 py-4 border-y border-border">
                 <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground uppercase border border-border">
                    {selectedArticle.author.charAt(0)}
                 </div>
                 <div>
                    <p className="font-bold text-sm text-foreground">{selectedArticle.author}</p>
                    <p className="text-xs text-muted-foreground">Đăng ngày {selectedArticle.date}</p>
                 </div>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none pt-4 text-sm leading-relaxed text-foreground/80 space-y-3">
                 <p className="text-base font-medium leading-relaxed">
                    {selectedArticle.description}
                 </p>
                 <div className="whitespace-pre-line text-sm mt-4 bg-muted/20 p-5 rounded-xl border border-border/40 text-foreground">
                    {selectedArticle.content}
                 </div>
                 <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
                    <Info className="h-6 w-6 text-primary shrink-0" />
                    <div>
                       <h4 className="font-bold text-primary">Ghi chú lâm sàng</h4>
                       <p className="text-xs text-primary/80 opacity-80 mt-1">Đây là nội dung tóm lược phục vụ mục đích tham khảo nhanh cho bác sĩ. Vui lòng đối chiếu với phác đồ hiện hành của bệnh viện.</p>
                    </div>
                 </div>
              </div>
          </div>

          {/* Article form dialog for create / edit */}
          <ArticleFormDialog
             open={showFormDialog}
             onOpenChange={setShowFormDialog}
             article={editingArticle}
             onSuccess={handleFormSuccess}
          />

          {/* Delete confirmation dialog */}
          <Dialog
            open={!!articleToDelete}
            onOpenChange={(open) => !open && setArticleToDelete(null)}
          >
            <DialogContent className="max-w-sm rounded-[24px] overflow-hidden border-none shadow-2xl p-0 bg-background">
              <div className="p-8 text-center bg-background">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 animate-pulse">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <DialogHeader className="p-0 mb-6">
                  <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Cảnh báo xóa!</DialogTitle>
                  <DialogDescription className="text-center font-medium text-[13px] opacity-70 mt-2">
                      Bài viết <strong className="text-foreground">{articleToDelete?.title}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống kiến thức. Hành động này không thể hoàn tác.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <Button
                      variant="destructive"
                      className="h-12 rounded-xl w-full font-bold text-[13px] shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all"
                      onClick={handleDeleteArticle}
                      disabled={isDeleting}
                  >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Tôi chắc chắn, hãy xóa ngay
                  </Button>
                  <Button
                      variant="outline"
                      className="h-12 rounded-xl w-full font-bold text-[13px] border-border/50 active:scale-[0.98] transition-all"
                      onClick={() => setArticleToDelete(null)}
                  >
                      Quay lại
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
       </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <PageHeader 
        title="Thư viện Kiến thức"
        icon={BookOpen}
        description="Cập nhật phác đồ chẩn đoán và điều trị viêm phổi tổng quát từ WHO và Bộ Y tế"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm tài liệu, phác đồ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-border bg-background rounded-lg shadow-sm focus-visible:ring-primary text-sm"
            />
          </div>
          {isAuthorized && (
            <Button
              onClick={() => {
                setEditingArticle(null);
                setShowFormDialog(true);
              }}
              className="h-9 rounded-lg gap-1.5 font-semibold text-sm shadow-sm shrink-0"
            >
              Viết bài mới
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Featured Section - Clinical Layout */}
      {featuredArticle && !searchQuery && activeTab === "all" && !isLoading && (
         <div 
           className="relative group cursor-pointer overflow-hidden rounded-2xl bg-slate-900 h-[320px] shadow-md transition-all duration-300 hover:shadow-lg"
           onClick={() => setSelectedArticle(featuredArticle)}
         >
            <Image 
              src={featuredArticle.image} 
              fill
              className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105" 
              alt="featured"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            
            <div className="absolute top-6 left-6">
               <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-none px-3 py-1 flex items-center gap-1.5 shadow-sm font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  Tiêu điểm
               </Badge>
            </div>

            <div className="absolute bottom-6 left-6 p-0 max-w-2xl text-white space-y-2">
               <h2 className="text-2xl font-bold leading-tight">
                  {featuredArticle.title}
               </h2>
               <p className="text-slate-300 line-clamp-2 text-sm leading-relaxed max-w-xl">
                  {featuredArticle.description}
               </p>
               <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                     <FileText className="h-3.5 w-3.5" /> Báo cáo chuyên sâu
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition-colors">
                     Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Tabs & Content */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto border border-border">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-xl px-6 py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all gap-2 font-bold text-sm"
                >
                  <Icon className="h-4 w-4" /> {cat.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((idx) => (
                <Card key={idx} className="rounded-2xl overflow-hidden flex flex-col border border-border">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-20 mt-4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Card 
                  key={article.id} 
                  className="group cursor-pointer border border-border shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col bg-card"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="relative h-40 w-full overflow-hidden border-b border-border">
                     <Image 
                      src={article.image} 
                      alt={article.title} 
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      unoptimized
                     />
                     <div className="absolute top-3 left-3">
                        <Badge className="bg-background/95 backdrop-blur-sm text-foreground border border-border font-medium shadow-sm">
                           {article.categoryLabel}
                        </Badge>
                     </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                       <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                       <span>•</span>
                       <span>{article.date}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                         <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase border border-border">
                            {article.author.charAt(0)}
                         </div>
                         <span className="text-xs font-medium text-muted-foreground">{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         {isAuthorized && (
                           <>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                               onClick={() => {
                                 setEditingArticle(article);
                                 setShowFormDialog(true);
                               }}
                             >
                                <Pencil className="h-3.5 w-3.5" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                               onClick={() => setArticleToDelete(article)}
                             >
                                <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                           </>
                         )}
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8 rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors"
                           onClick={() => setSelectedArticle(article)}
                         >
                            <ExternalLink className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && articles.length === 0 && (
             <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/30 rounded-[3rem] border border-dashed border-border">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                   <Search className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-foreground">Không tìm thấy tài liệu</h3>
                   <p className="text-muted-foreground text-sm">Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại.</p>
                </div>
                <Button variant="outline" onClick={() => {setSearchQuery(""); setActiveTab("all")}}>
                   Xóa tất cả bộ lọc
                </Button>
             </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Newsletter / Contribution Sidebar - Refined */}
       <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
             <h2 className="text-xl font-bold text-primary">Chia sẻ phác đồ & kinh nghiệm lâm sàng?</h2>
             <p className="text-muted-foreground text-sm leading-relaxed">
                Gửi các bài báo cáo ca bệnh hoặc cập nhật nghiên cứu mới trong lĩnh vực Phổi để cùng xây dựng cộng đồng y khoa phát triển.
             </p>
          </div>
          <div className="flex gap-3 shrink-0">
             <Button 
                onClick={() => {
                   if (isAuthorized) {
                      setEditingArticle(null);
                      setShowFormDialog(true);
                   } else {
                      toast.info("Chức năng này dành cho Bác sĩ và Quản trị viên.");
                   }
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-9 font-medium shadow-sm"
             >
                Đóng góp bài viết
             </Button>
          </div>
       </div>

       {/* Article form dialog for create / edit */}
       <ArticleFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
          article={editingArticle}
          onSuccess={handleFormSuccess}
       />

       {/* Delete confirmation dialog */}
       <Dialog
         open={!!articleToDelete}
         onOpenChange={(open) => !open && setArticleToDelete(null)}
       >
         <DialogContent className="max-w-sm rounded-[24px] overflow-hidden border-none shadow-2xl p-0 bg-background">
           <div className="p-8 text-center bg-background">
             <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 animate-pulse">
                 <AlertCircle className="h-8 w-8 text-destructive" />
             </div>
             <DialogHeader className="p-0 mb-6">
               <DialogTitle className="text-center font-black uppercase text-xl text-destructive tracking-tight">Cảnh báo xóa!</DialogTitle>
               <DialogDescription className="text-center font-medium text-[13px] opacity-70 mt-2">
                   Bài viết <strong className="text-foreground">{articleToDelete?.title}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống kiến thức. Hành động này không thể hoàn tác.
               </DialogDescription>
             </DialogHeader>
             <div className="flex flex-col gap-3">
               <Button
                   variant="destructive"
                   className="h-12 rounded-xl w-full font-bold text-[13px] shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all"
                   onClick={handleDeleteArticle}
                   disabled={isDeleting}
               >
                   {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                   Tôi chắc chắn, hãy xóa ngay
               </Button>
               <Button
                   variant="outline"
                   className="h-12 rounded-xl w-full font-bold text-[13px] border-border/50 active:scale-[0.98] transition-all"
                   onClick={() => setArticleToDelete(null)}
               >
                   Quay lại
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  );
}
