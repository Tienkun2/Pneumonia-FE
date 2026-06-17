import { NextResponse } from "next/server";

interface Message {
  id?: string;
  sender: "bot" | "user";
  text: string;
  isMarkdown?: boolean;
}


const _SYSTEM_INSTRUCTION = `Bạn là Trợ lý Lâm sàng PlumoX, một trợ lý y tế chuyên khoa hô hấp chuyên nghiệp và tận tụy, hỗ trợ các bác sĩ chẩn đoán viêm phổi.
Nhiệm vụ của bạn là hỗ trợ bác sĩ giải đáp các thắc mắc chuyên môn lâm sàng liên quan đến viêm phổi, các phác đồ kháng sinh của Bộ Y tế Việt Nam (CAP ngoại trú, nội trú thường, ICU), phân tích hình ảnh X-quang phổi và các hướng dẫn chăm sóc hỗ trợ.
Quy tắc trả lời:
1. Sử dụng ngôn ngữ tiếng Việt y khoa chuẩn xác, lịch sự và chuyên nghiệp.
2. Trình bày bằng định dạng Markdown rõ ràng, sử dụng bảng, danh sách gạch đầu dòng để thông tin dễ đọc.
3. Khi trả lời về chẩn đoán hoặc điều trị, luôn đưa ra khuyến cáo mang tính tham khảo y khoa và nhắc nhở bác sĩ đối chiếu với tình trạng thực tế của bệnh nhân.
4. Trả lời ngắn gọn, trực quan, tập trung vào câu hỏi của bác sĩ.`;

const FALLBACK_KNOWLEDGE: { keywords: string[]; response: string }[] = [
  {
    keywords: ["phác đồ", "cap", "cộng đồng"],
    response: `### Phác đồ điều trị Viêm phổi mắc phải cộng đồng (CAP) - Bộ Y tế:

Phân loại mức độ nặng theo thang điểm **CURB-65**:
- **CURB-65 = 0-1 (Nhẹ):** Điều trị ngoại trú.
  * *Lựa chọn 1:* Amoxicillin (1g x 3 lần/ngày) hoặc Doxycycline (100mg x 2 lần/ngày).
  * *Lựa chọn 2 (Nếu nghi ngờ vi khuẩn không điển hình):* Macrolide (Clarithromycin 500mg x 2 lần/ngày hoặc Azithromycin 500mg/ngày).
- **CURB-65 = 2 (Trung bình):** Điều trị nội trú ngắn hạn.
  * *Phối hợp:* Beta-lactam tiêm truyền (Ceftriaxone 1-2g/ngày hoặc Cefotaxime 1-2g mỗi 8 giờ) **KẾT HỢP** Macrolide uống/tiêm truyền.
  * *Hoặc:* Levofloxacin (750mg/ngày) đơn trị liệu.
- **CURB-65 ≥ 3 (Nặng):** Nhập viện điều trị tích cực (ICU nếu CURB-65 ≥ 4).
  * *Phối hợp:* Beta-lactam tiêm truyền kháng Pseudomonal (Cefepime hoặc Piperacillin/Tazobactam) **KẾT HỢP** Fluoroquinolone hô hấp (Levofloxacin/Moxifloxacin).`
  },
  {
    keywords: ["phân biệt", "điển hình", "không điển hình", "x-quang"],
    response: `### Phân biệt Viêm phổi điển hình và Không điển hình trên X-quang:

| Đặc điểm | Viêm phổi điển hình (Thùy) | Viêm phổi không điển hình |
| :--- | :--- | :--- |
| **Hình ảnh X-quang** | Đông đặc thù phổi rõ rệt, ranh giới rõ, có dấu hiệu phế quản phế nang khí (Air bronchogram). | Tổn thương dạng lưới nốt lan tỏa hai bên, tập trung nhiều ở rốn phổi, thâm nhiễm kẽ phổi. |
| **Lâm sàng** | Khởi phát cấp tính, sốt cao, rét run, ho đờm mủ, đau ngực màng phổi. | Khởi phát từ từ, sốt nhẹ, ho khan kéo dài, nhức đầu, mệt mỏi toàn thân. |
| **Tác nhân thường gặp** | *Streptococcus pneumoniae, Haemophilus influenzae* | *Mycoplasma pneumoniae, Chlamydia pneumoniae, Legionella* |`
  },
  {
    keywords: ["kháng sinh", "liều dùng", "thuốc"],
    response: `### Khuyến cáo kháng sinh ban đầu cho Người lớn (CAP trung bình - CURB-65 = 2):

1. **Phác đồ phối hợp (Ưu tiên lựa chọn):**
   - **Beta-lactam:** Ceftriaxone (1 - 2g tiêm tĩnh mạch/ngày) hoặc Cefotaxime (1 - 2g tiêm tĩnh mạch mỗi 8 giờ).
   - **Macrolide phối hợp:** Azithromycin (500mg uống/ngày) hoặc Clarithromycin (500mg uống 2 lần/ngày).
2. **Phác đồ đơn trị liệu (Fluoroquinolone hô hấp):**
   - Levofloxacin (750mg tiêm tĩnh mạch hoặc uống/ngày).
   - Moxifloxacin (400mg tiêm tĩnh mạch hoặc uống/ngày).
   
*Lưu ý: Thời gian điều trị tiêu chuẩn thường từ 5 - 7 ngày và bệnh nhân phải hết sốt ít nhất 48 - 72 giờ trước khi ngưng kháng sinh.*`
  },
  {
    keywords: ["curb65", "curb-65", "thang điểm"],
    response: `### Thang điểm đánh giá độ nặng Viêm phổi CURB-65:

Mỗi yếu tố tương ứng với **1 điểm**:
1. **C**onfusion: Lú lẫn, giảm tỉnh táo (AMTS ≤ 8).
2. **U**rea: Urê huyết > 7 mmol/L (~19 mg/dL).
3. **R**espiratory Rate: Nhịp thở ≥ 30 lần/phút.
4. **B**lood Pressure: Huyết áp tâm thu < 90 mmHg hoặc huyết áp tâm trương ≤ 60.
5. **65**: Tuổi bệnh nhân từ 65 trở lên.

**Định hướng xử trí lâm sàng:**
*   **0 - 1 điểm**: Nguy cơ tử vong thấp (1.5%). Điều trị ngoại trú.
*   **2 điểm**: Nguy cơ tử vong trung bình (9.2%). Nhập viện điều trị nội trú ngắn hạn hoặc theo dõi sát.
*   **3 - 5 điểm**: Nguy cơ tử vong cao (22% - 57%). Nhập viện điều trị nội trú tích cực (Cân nhắc ICU nếu từ 4 điểm).`
  }
];

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json() as { message: string; history: Message[] };
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // ── CALL FASTAPI CHAT ENDPOINT (FINE-TUNED LLM) ─────────────────
    try {
      const aiApiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://127.0.0.1:8000/api/v1";
      const messages = [];

      // Map history to FastAPI chat format (user/assistant)
      if (history && history.length > 0) {
        for (const msg of history) {
          if (msg.id === "welcome") continue;
          messages.push({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
          });
        }
      }

      // Add current user message
      messages.push({
        role: "user",
        content: message
      });

      const response = await fetch(`${aiApiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`FastAPI chat returned status ${response.status}`);
      }

      const data = await response.json();
      const botText = data.text || "Không nhận được phản hồi từ AI.";

      return NextResponse.json({ text: botText, source: "fastapi-llm" });
    } catch (apiError) {
      console.warn("FastAPI chat failed, falling back to local simulation mode:", apiError);
      
      // ── MOCK FALLBACK MODE ──────────────────────────────────────────
      const lowerMsg = message.toLowerCase();
      let matchedResponse = "";

      for (const item of FALLBACK_KNOWLEDGE) {
        if (item.keywords.some(kw => lowerMsg.includes(kw))) {
          matchedResponse = item.response;
          break;
        }
      }

      if (!matchedResponse) {
        matchedResponse = `### Tham khảo lâm sàng từ PlumoX:

Tôi nhận được câu hỏi về: *"${message}"*. 

Để hỗ trợ đối chiếu lâm sàng chính xác cho ca bệnh viêm phổi này, bác sĩ có thể cung cấp thêm các thông tin như:
1. **Hình ảnh X-quang**: Phổi có thâm nhiễm kẽ, đám mờ đông đặc thù hay xẹp phổi không?
2. **Các chỉ số lâm sàng chính**: Nhịp thở, SpO2, huyết áp và trạng thái tri giác (để tính điểm CURB-65).
3. **Triệu chứng kèm theo**: Bệnh nhân ho khan hay ho có đờm, có sốt cao không?

*Bác sĩ có thể đặt các câu hỏi liên quan đến phác đồ kháng sinh CAP của Bộ Y tế, cách phân biệt viêm phổi điển hình/không điển hình hoặc thang điểm CURB-65 để tôi hỗ trợ tra cứu nhanh.*`;
      }

      // Simulate a small delay for natural feeling
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({ text: matchedResponse, source: "mock-fallback" });
    }

  } catch (error: unknown) {
    console.error("Error in AI Chat API route:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
