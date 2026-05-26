import { api } from "@/services/api-client";
import { Article } from "@/types/article";

export const ArticleService = {
  getArticles: (search?: string, category?: string) => {
    let query = "/articles";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "all") params.append("category", category);

    const queryString = params.toString();
    if (queryString) query += `?${queryString}`;

    return api.get<Article[]>(query);
  },

  getArticleById: (id: string) => api.get<Article>(`/articles/${id}`),

  createArticle: (payload: Partial<Article>) => api.post<Article>("/articles", payload),

  updateArticle: (id: string, payload: Partial<Article>) => api.put<Article>(`/articles/${id}`, payload),

  deleteArticle: (id: string) => api.delete<void>(`/articles/${id}`),

  uploadArticleImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<string>("/articles/upload-image", formData);
  },
};
