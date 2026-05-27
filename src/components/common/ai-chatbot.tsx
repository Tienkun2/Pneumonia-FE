"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Send,
  User,
  ShieldCheck,
  PlusCircle,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  isMarkdown?: boolean;
}

const QUICK_PROMPTS = [
  {
    label: "Phác đồ viêm phổi CAP",
    text: "Phác đồ điều trị viêm phổi mắc phải cộng đồng (CAP) theo khuyến cáo của Bộ Y tế là gì?"
  },
  {
    label: "Phân biệt viêm phổi điển hình/không điển hình",
    text: "Làm thế nào để phân biệt viêm phổi điển hình và viêm phổi không điển hình trên phim X-quang?"
  },
  {
    label: "Liều dùng kháng sinh ban đầu",
    text: "Liều dùng kháng sinh ban đầu khuyến cáo cho viêm phổi mức độ trung bình ở người lớn?"
  }
];

const BOT_KNOWLEDGE: Record<string, string> = {
  cap: `### Phác đồ điều trị Viêm phổi mắc phải cộng đồng (CAP) - Bộ Y tế:

Phân loại mức độ nặng theo thang điểm **CURB-65**:
- **CURB-65 = 0-1 (Nhẹ):** Điều trị ngoại trú.
  * *Lựa chọn 1:* Amoxicillin (1g x 3 lần/ngày) hoặc Doxycycline (100mg x 2 lần/ngày).
  * *Lựa chọn 2 (Nếu nghi ngờ vi khuẩn không điển hình):* Macrolide (Clarithromycin 500mg x 2 lần/ngày hoặc Azithromycin 500mg/ngày).
- **CURB-65 = 2 (Trung bình):** Điều trị nội trú ngắn hạn.
  * *Phối hợp:* Beta-lactam tiêm truyền (Ceftriaxone 1-2g/ngày hoặc Cefotaxime 1-2g mỗi 8 giờ) **KẾT HỢP** Macrolide uống/tiêm truyền.
  * *Hoặc:* Levofloxacin (750mg/ngày) đơn trị liệu.
- **CURB-65 ≥ 3 (Nặng):** Nhập viện cấp cứu (cân nhắc ICU nếu CURB-65 ≥ 4).
  * *Phối hợp:* Beta-lactam tiêm truyền kháng Pseudomonal (Cefepime hoặc Piperacillin/Tazobactam) **KẾT HỢP** Fluoroquinolone hô hấp (Levofloxacin/Moxifloxacin).`,

  distinction: `### Phân biệt Viêm phổi điển hình và Không điển hình:

| Đặc điểm | Viêm phổi điển hình (Kế hoạch) | Viêm phổi không điển hình |
| :--- | :--- | :--- |
| **Tác nhân** | *S. pneumoniae, H. influenzae* | *Mycoplasma pneumoniae, Chlamydophila, Legionella* |
| **Lâm sàng** | Khởi phát cấp tính, sốt cao, rét run, ho đờm mủ, đau ngực màng phổi. | Khởi phát từ từ, sốt nhẹ, ho khan kéo dài, đau đầu, đau cơ dai dẳng. |
| **X-quang** | Đông đặc thù phổi rõ rệt, có phế quản hơi (Air bronchogram). | Tổn thương dạng lưới nốt lan tỏa hai bên rốn phổi, thâm nhiễm kẽ. |
| **Bạch cầu** | Bạch cầu tăng cao, chuyển trái (ưu thế Neutrophil). | Bạch cầu bình thường hoặc tăng nhẹ. |`,

  antibiotic: `### Khuyến cáo kháng sinh ban đầu cho Người lớn (CAP trung bình):

Điều trị nội trú tại khoa thường (CURB-65 = 2):
1. **Phác đồ phối hợp (Ưu tiên):**
   - **Beta-lactam:** Ceftriaxone (1 - 2g tiêm tĩnh mạch/ngày) hoặc Cefotaxime (1 - 2g tiêm tĩnh mạch mỗi 8 giờ).
   - **Kèm theo Macrolide:** Azithromycin (500mg uống/ngày) hoặc Clarithromycin (500mg uống 2 lần/ngày).
2. **Phác đồ đơn trị liệu (Fluoroquinolone hô hấp):**
   - Levofloxacin (750mg tiêm tĩnh mạch hoặc uống/ngày).
   - Moxifloxacin (400mg tiêm tĩnh mạch hoặc uống/ngày).
*Thời gian điều trị tiêu chuẩn: 5 - 7 ngày (phải hết sốt từ 48 - 72 giờ trước khi ngưng).*`
};

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Chào bác sĩ! Tôi là trợ lý lâm sàng chuyên khoa hô hấp PlumoX. Tôi hỗ trợ bác sĩ tra cứu nhanh phác đồ điều trị, hướng dẫn sử dụng kháng sinh lâm sàng hoặc đối chiếu thông tin y học hô hấp. Bác sĩ cần thông tin gì cho ca bệnh hôm nay?",
      isMarkdown: false
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: messages
        }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.text || "Xin lỗi bác sĩ, tôi gặp khó khăn khi xử lý yêu cầu này.",
          isMarkdown: true
        }
      ]);
    } catch (error) {
      console.error("AI Chatbot error:", error);
      
      // Smart client-side fallback if the API fails entirely
      let responseText = "Xin lỗi bác sĩ, tôi gặp sự cố kết nối mạng. Hãy thử tra cứu thông tin y học thông qua các nút gợi ý câu hỏi nhanh bên dưới.";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("phác đồ") || lowerText.includes("cap") || lowerText.includes("cộng đồng")) {
        responseText = BOT_KNOWLEDGE.cap;
      } else if (lowerText.includes("phân biệt") || lowerText.includes("điển hình") || lowerText.includes("không điển hình")) {
        responseText = BOT_KNOWLEDGE.distinction;
      } else if (lowerText.includes("kháng sinh") || lowerText.includes("liều dùng") || lowerText.includes("thuốc")) {
        responseText = BOT_KNOWLEDGE.antibiotic;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: responseText,
          isMarkdown: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-500/20",
          isOpen
            ? "bg-rose-500 hover:bg-rose-600 text-white rotate-90"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 shadow-lg"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Stethoscope className="h-6 w-6" />}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[550px] flex flex-col border border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-border/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Stethoscope className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  Trợ lý Lâm sàng PlumoX
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Trực tuyến • Hỗ trợ lâm sàng</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] font-semibold text-emerald-500 border-emerald-500/20 bg-emerald-500/5 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Y KHOA chuẩn
            </Badge>
          </div>

          {/* Message List Area */}
          <ScrollArea className="flex-1 p-4 space-y-4">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5 max-w-[85%] items-start",
                    msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold shadow-sm",
                      msg.sender === "user"
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    )}
                  >
                    {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Stethoscope className="h-3.5 w-3.5" />}
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm font-medium",
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-muted/40 border border-border/40 text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.isMarkdown ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none text-xs space-y-2 text-inherit [&>h3]:font-bold [&>h3]:text-sm [&>h3]:mt-1 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&>table_th]:border [&>table_th]:border-border [&>table_th]:p-1 [&>table_th]:bg-muted/50 [&>table_td]:border [&>table_td]:border-border [&>table_td]:p-1">
                        {/* Custom markdown parsing for structured text */}
                        {msg.text.split("\n").map((line, idx) => {
                          if (line.startsWith("### ")) {
                            return <h3 key={idx} className="font-bold text-sm mt-2">{line.replace("### ", "")}</h3>;
                          }
                          if (line.startsWith("- ") || line.startsWith("* ")) {
                            return (
                              <ul key={idx} className="list-disc pl-4 my-1">
                                <li>{line.replace(/^[-*]\s+/, "")}</li>
                              </ul>
                            );
                          }
                          if (line.startsWith("|")) {
                            // Simple table row detector
                            const cells = line.split("|").map(c => c.trim()).filter(Boolean);
                            if (cells[0].includes("---")) return null; // Separator row
                            return (
                              <div key={idx} className="grid grid-cols-3 gap-2 py-1 border-b border-border/30 font-semibold text-[10px]">
                                {cells.map((cell, cidx) => (
                                  <span key={cidx} className={cn(cidx === 0 && "text-muted-foreground")}>{cell}</span>
                                ))}
                              </div>
                            );
                          }
                          return <p key={idx} className="my-1">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 items-center max-w-[85%] self-start">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-muted/40 border border-border/40 rounded-2xl rounded-tl-none px-4 py-2.5 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Quick Prompts Panel */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-muted/20 border-t border-border/30 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-primary" /> Câu hỏi nhanh gợi ý:
              </p>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="text-left text-[11px] font-bold text-foreground/80 hover:text-primary hover:bg-primary/5 border border-border/50 hover:border-primary/20 bg-background/50 px-3 py-2 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <span>{prompt.label}</span>
                    <PlusCircle className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-border/50 bg-background flex gap-2 items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(inputValue);
              }}
              placeholder="Nhập câu hỏi lâm sàng tại đây..."
              className="flex-1 h-9 rounded-xl border-border/60 bg-muted/20 text-xs focus-visible:ring-primary/20 resize-none font-semibold"
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              size="icon"
              className="h-9 w-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl shrink-0 shadow-md shadow-primary/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
