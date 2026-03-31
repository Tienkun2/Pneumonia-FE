"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Article = typeof mockArticles[0];

const categories = [
  { id: "all", label: "Tất cả", icon: BookOpen },
  { id: "diagnosis", label: "Hướng dẫn chẩn đoán", icon: Stethoscope },
  { id: "lab", label: "Cận lâm sàng", icon: Microscope },
  { id: "research", label: "Nghiên cứu & AI", icon: TrendingUp },
];

const mockArticles = [
  {
    id: "1",
    title: "Phân loại mức độ nặng của viêm phổi ở trẻ em",
    category: "diagnosis",
    categoryLabel: "Chẩn đoán",
    description: "Tiêu chuẩn đánh giá từ WHO và Bộ Y tế cho trẻ từ 2 tháng đến 5 tuổi, bao gồm các dấu hiệu rút lõm lồng ngực và thở nhanh.",
    content: "Nội dung chi tiết...",
    author: "BS. TS. Nguyễn Thu Hà",
    readTime: "8 phút",
    date: "2024-03-15",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
    tags: ["WHO", "Nhi khoa", "Phân loại"],
    isFeatured: true,
  },
  {
    id: "2",
    title: "Ứng dụng CNN trong phân tích X-quang phổi",
    category: "research",
    categoryLabel: "Công nghệ",
    description: "Khám phá cách mạng của trí tuệ nhân tạo trong việc hỗ trợ bác sĩ chẩn đoán sớm viêm phổi qua hình ảnh X-quang kỹ thuật số.",
    author: "GS. Lê Hoàng Long",
    readTime: "12 phút",
    date: "2024-03-20",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=400",
    tags: ["AI", "Deep Learning", "X-ray"],
    isFeatured: false,
  },
  {
    id: "3",
    title: "Chỉ số CRP và Procalcitonin: Khi nào cần xét nghiệm?",
    category: "lab",
    categoryLabel: "Xét nghiệm",
    description: "Sự khác biệt giữa CRP và Procalcitonin trong việc phân biệt viêm phổi do vi khuẩn và do virus ở trẻ em.",
    author: "BS. Phạm Minh Quân",
    readTime: "6 phút",
    date: "2024-03-10",
    image: "https://images.unsplash.com/photo-1579152276503-3466f286e107?auto=format&fit=crop&q=80&w=400",
    tags: ["Biomarkers", "Xét nghiệm máu"],
    isFeatured: false,
  },
  {
    id: "4",
    title: "Hướng dẫn sử dụng kháng sinh ban đầu",
    category: "diagnosis",
    categoryLabel: "Điều trị",
    description: "Phác đồ lựa chọn kháng sinh kinh nghiệm cho trẻ bị viêm phổi cộng đồng mức độ trung bình.",
    author: "Bộ Y Tế",
    readTime: "15 phút",
    date: "2024-02-28",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
    tags: ["Kháng sinh", "Điều trị"],
    isFeatured: false,
  },
];

export function KnowledgeView() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = mockArticles.filter((article) => {
    const matchesTab = activeTab === "all" || article.category === activeTab;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const featuredArticle = mockArticles.find(a => a.isFeatured);

  if (selectedArticle) {
    return (
       <div className="space-y-6 max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="mb-4">
              Quay lại danh sách
          </Button>
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
             <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">{selectedArticle.title}</h1>
             <div className="flex items-center gap-3 py-4 border-y border-slate-100">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div>
                   <p className="font-bold text-sm text-slate-800">{selectedArticle.author}</p>
                   <p className="text-xs text-slate-400">Đăng ngày {selectedArticle.date}</p>
                </div>
             </div>
             <div className="prose prose-slate max-w-none pt-4">
                <p className="text-lg leading-relaxed text-slate-600">
                   {selectedArticle.description}
                </p>
                <div className="mt-8 p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex gap-4">
                   <Info className="h-6 w-6 text-blue-600 shrink-0" />
                   <div>
                      <h4 className="font-bold text-blue-900">Ghi chú lâm sàng</h4>
                      <p className="text-sm text-blue-700 opacity-80">Đây là nội dung tóm lược phục vụ mục đích tham khảo nhanh cho bác sĩ. Vui lòng đối chiếu với phác đồ hiện hành của bệnh viện.</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 shrink-0 mt-1 sm:mt-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thư viện Kiến thức</h1>
            <p className="text-sm text-slate-500 mt-1">
               Cập nhật phác đồ chẩn đoán và điều trị viêm phổi nhi khoa từ WHO và Bộ Y tế
            </p>
          </div>
        </div>
        <div className="relative w-full lg:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm tài liệu, phác đồ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 border-slate-200 rounded-lg shadow-sm focus-visible:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Featured Section - Clinical Layout */}
      {featuredArticle && !searchQuery && activeTab === "all" && (
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
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-100">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all gap-2 font-bold text-sm"
                >
                  <Icon className="h-4 w-4" /> {cat.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card 
                key={article.id} 
                className="group cursor-pointer border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col bg-white"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="relative h-40 w-full overflow-hidden border-b border-slate-100">
                   <Image 
                    src={article.image} 
                    alt={article.title} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    unoptimized
                   />
                   <div className="absolute top-3 left-3">
                      <Badge className="bg-white/95 backdrop-blur-sm text-slate-700 border border-slate-200 font-medium shadow-sm">
                         {article.categoryLabel}
                      </Badge>
                   </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-2">
                     <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                     <span>•</span>
                     <span>{article.date}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
                          {article.author.charAt(0)}
                       </div>
                       <span className="text-xs font-medium text-slate-600">{article.author}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                       <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
               <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-slate-300" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-800">Không tìm thấy tài liệu</h3>
                  <p className="text-slate-400 text-sm">Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại.</p>
               </div>
               <Button variant="outline" onClick={() => {setSearchQuery(""); setActiveTab("all")}}>
                  Xóa tất cả bộ lọc
               </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Newsletter / Contribution Sidebar - Refined */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="space-y-3 max-w-2xl">
            <h2 className="text-xl font-bold text-blue-900">Chia sẻ phác đồ & kinh nghiệm lâm sàng?</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
               Gửi các bài báo cáo ca bệnh hoặc cập nhật nghiên cứu mới trong khoang Nhi khoa để cùng xây dựng cộng đồng y khoa phát triển.
            </p>
         </div>
         <div className="flex gap-3 shrink-0">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg h-9 font-medium shadow-sm">
              Đóng góp bài viết
            </Button>
         </div>
      </div>
    </div>
  );
}
