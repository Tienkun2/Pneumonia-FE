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
4. LƯU Ý QUAN TRỌNG: Tuyệt đối không tự ý kê đơn, không đưa ra tên thuốc hay liều lượng điều trị cụ thể (không ghi các liều thuốc cụ thể như Amoxicillin 1g, Ceftriaxone, v.v.). Hãy định hướng xử trí chung theo phân loại CURB-65 và khuyến cáo của Bộ Y tế Việt Nam, đề xuất bác sĩ tham khảo phác đồ chi tiết tại Quyết định số 4815/QĐ-BYT.
5. Trả lời ngắn gọn, trực quan, tập trung vào câu hỏi của bác sĩ.`;

const FALLBACK_KNOWLEDGE: { keywords: string[]; response: string }[] = [
  {
    keywords: ["phác đồ", "cap", "cộng đồng"],
    response: `### Hướng xử trí Viêm phổi mắc phải cộng đồng (CAP) - Theo khuyến cáo Bộ Y tế:

Phân loại mức độ nặng theo thang điểm **CURB-65**:
- **CURB-65 = 0-1 (Nhẹ):** Điều trị ngoại trú.
  * *Định hướng xử trí:* Bệnh nhân có thể điều trị tại nhà dưới sự theo dõi chặt chẽ của y tế cơ sở.
  * *Lựa chọn kháng sinh ban đầu:* Ưu tiên sử dụng kháng sinh đường uống đơn trị liệu (nhóm Beta-lactam hoặc Tetracycline). Nếu nghi ngờ có tác nhân vi khuẩn không điển hình, cân nhắc bổ sung hoặc thay thế bằng nhóm Macrolide đường uống.
  * *Lưu ý:* Bác sĩ vui lòng tham khảo chi tiết phác đồ lựa chọn thuốc và liều lượng cụ thể tại Mục 4.1 của Hướng dẫn ban hành kèm theo **Quyết định số 4815/QĐ-BYT**.
- **CURB-65 = 2 (Trung bình):** Điều trị nội trú ngắn hạn tại khoa thường.
  * *Định hướng xử trí:* Nhập viện điều trị hoặc theo dõi sát tại đơn vị lưu bệnh trú ngắn ngày.
  * *Lựa chọn kháng sinh ban đầu:* Khuyến cáo phối hợp kháng sinh Beta-lactam tiêm truyền kết hợp với Macrolide đường uống/tiêm truyền, hoặc đơn trị liệu bằng Fluoroquinolone hô hấp đường tiêm/uống.
  * *Lưu ý:* Chi tiết nhóm thuốc và liều dùng cụ thể phải tuân thủ Mục 4.2 của Hướng dẫn ban hành kèm theo **Quyết định số 4815/QĐ-BYT**.
- **CURB-65 ≥ 3 (Nặng):** Nhập viện điều trị nội trú tích cực (Cấp cứu/ICU nếu CURB-65 ≥ 4).
  * *Định hướng xử trí:* Nhập viện khẩn cấp, điều trị tại khoa Hồi sức tích cực (ICU) hoặc phòng cấp cứu chuyên khoa.
  * *Lựa chọn kháng sinh ban đầu:* Phác đồ phối hợp kháng sinh Beta-lactam tiêm truyền phổ rộng (ưu tiên nhóm kháng Pseudomonal nếu có yếu tố nguy cơ) kết hợp với Fluoroquinolone hô hấp tiêm truyền hoặc Macrolide tiêm truyền.
  * *Lưu ý:* Liều lượng và cách phối hợp thuốc chi tiết được quy định tại Mục 4.3 của Hướng dẫn ban hành kèm theo **Quyết định số 4815/QĐ-BYT**.`
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
    response: `### Hướng dẫn sử dụng Kháng sinh ban đầu cho Người lớn (CAP trung bình - CURB-65 = 2):

Theo khuyến cáo của Bộ Y tế Việt Nam cho bệnh nhân viêm phổi mắc phải cộng đồng mức độ trung bình điều trị tại khoa thường:
1. **Nguyên tắc lựa chọn kháng sinh:**
   - **Phác đồ phối hợp (Ưu tiên):** Kết hợp một kháng sinh nhóm Beta-lactam đường tiêm truyền (ví dụ: Cephalosporin thế hệ 3) với một kháng sinh nhóm Macrolide (đường uống hoặc tiêm truyền) để bao phủ cả vi khuẩn điển hình và không điển hình.
   - **Phác đồ đơn trị liệu:** Sử dụng một kháng sinh nhóm Fluoroquinolone hô hấp (đường uống hoặc tiêm truyền) cho hiệu quả diệt khuẩn rộng.
2. **Thời gian điều trị:**
   - Thường kéo dài từ 5 - 7 ngày đối với viêm phổi không biến chứng. Bệnh nhân cần đạt tiêu chuẩn ổn định lâm sàng và hết sốt ít nhất 48 - 72 giờ trước khi xem xét dừng kháng sinh.
   
*LƯU Ý LÂM SÀNG: AI không tự ra quyết định phác đồ, không kê đơn hay chỉ định liều lượng cụ thể. Bác sĩ vui lòng tham khảo chi tiết danh mục thuốc, liều dùng và hướng dẫn phối hợp tại Hướng dẫn chẩn đoán và điều trị viêm phổi mắc phải cộng đồng ở người lớn ban hành theo **Quyết định số 4815/QĐ-BYT**.*`
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
