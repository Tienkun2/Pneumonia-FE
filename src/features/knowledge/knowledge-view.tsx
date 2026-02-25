"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";

// Mock data
const mockArticles = [
  {
    id: "1",
    title: "Hướng dẫn chẩn đoán viêm phổi cộng đồng",
    category: "Hướng dẫn",
    description:
      "Hướng dẫn chi tiết về các tiêu chuẩn chẩn đoán và điều trị viêm phổi cộng đồng theo khuyến nghị của Bộ Y tế.",
    date: "2024-01-15",
    tags: ["Viêm phổi", "Chẩn đoán", "Điều trị"],
  },
  {
    id: "2",
    title: "Phân tích hình ảnh X-quang trong viêm phổi",
    category: "Kiến thức",
    description:
      "Các dấu hiệu hình ảnh học đặc trưng của viêm phổi trên X-quang ngực và cách phân biệt với các bệnh lý khác.",
    date: "2024-01-10",
    tags: ["X-quang", "Hình ảnh học", "Chẩn đoán"],
  },
  {
    id: "3",
    title: "Xét nghiệm cận lâm sàng trong viêm phổi",
    category: "Kiến thức",
    description:
      "Vai trò của các xét nghiệm như WBC, CRP, Procalcitonin trong chẩn đoán và theo dõi viêm phổi.",
    date: "2024-01-05",
    tags: ["Xét nghiệm", "Cận lâm sàng", "Chẩn đoán"],
  },
];

export function KnowledgeView() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = mockArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kiến thức y khoa</h1>
        <p className="text-muted-foreground">
          Tài liệu và hướng dẫn chẩn đoán
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <BookOpen className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {article.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {article.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{article.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy bài viết nào
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
