# 🏥 Clinical Decision Support System - Frontend (CDSS FE)

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.8-764abc.svg?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn/UI-Radix-black.svg?style=for-the-badge&logo=shadcnui)](https://ui.shadcn.com/)

*Đọc bằng ngôn ngữ khác: [🇻🇳 Tiếng Việt](#-tiếng-việt) | [🇬🇧 English](#-english)*

---

## 🇻🇳 Tiếng Việt

Giao diện người dùng (Frontend) của **Hệ thống Hỗ trợ Quyết định Lâm sàng (CDSS) Chẩn đoán Viêm phổi**. Ứng dụng được xây dựng trên nền tảng **Next.js 15 (App Router)** và **TypeScript**, cung cấp cho bác sĩ lâm sàng một không gian làm việc số hóa trực quan, hiện đại và kết nối thời gian thực với các dịch vụ AI và Backend.

### 🚀 Tính Năng Chính

1. **Không gian Chẩn đoán Đa phương thức (Diagnostic Workspace)**:
   - Tải phim X-quang phổi thẳng (`react-dropzone`).
   - Tích hợp bộ đánh giá 10 triệu chứng lâm sàng chuẩn hóa.
   - Máy tính điểm lâm sàng **CURB-65** trực quan.
   - So sánh trực quan phim X-quang gốc và bản đồ nhiệt tổn thương **Grad-CAM** thông qua thanh trượt tương tác (Slider/Overlay).
2. **Biên soạn Báo cáo thông minh**:
   - Nhận báo cáo phân tích định tính từ mô hình GenAI LLM.
   - Nút hành động nhanh giúp đồng bộ báo cáo của AI vào phần kết luận của Bác sĩ.
   - Cho phép chỉnh sửa kết luận lâm sàng và xuất báo cáo y khoa dạng **PDF** chuyên nghiệp hoặc in trực tiếp.
3. **Quản lý Hồ sơ Bệnh nhân (Patient CRUD)**:
   - Lưu trữ, tìm kiếm và truy xuất thông tin hành chính bệnh nhân.
   - Quản lý lịch sử các lần thăm khám và kết quả chẩn đoán trước đó.
4. **Chatbot Y tế Chuyên khoa (Clinical Chatbot)**:
   - Chatbot tương tác thời gian thực kết nối với mô hình LLM hô hấp.
   - Hỗ trợ bác sĩ tra cứu nhanh phác đồ kháng sinh CAP của Bộ Y tế, phân biệt viêm phổi điển hình/không điển hình, tính điểm CURB-65.
5. **Bảng Thống kê & Giám sát (Dashboard)**:
   - Thống kê trực quan xu hướng ca bệnh và phân bố mức độ rủi ro (Thấp, Trung bình, Cao) bằng biểu đồ **Recharts**.

### 🛠️ Công Nghệ Sử Dụng

- **Framework chính**: Next.js 15 (App Router) & React 18
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS v4 (tích hợp PostCSS)
- **Thư viện UI**: Shadcn/UI (xây dựng trên Radix UI Primitives)
- **Quản lý trạng thái**: Redux Toolkit & React Redux
- **Xử lý Form**: React Hook Form kết hợp xác thực dữ liệu bằng Zod
- **Truy vấn dữ liệu**: TanStack Query (React Query) & Axios
- **Kết nối thời gian thực**: WebSockets (`@stomp/stompjs` & `sockjs-client`)
- **Xuất bản**: `jspdf` & `html2canvas` để chuyển đổi tài liệu và in ấn

### 📂 Cấu Trúc Thư Mục

```text
src/
├── app/                  # Cấu trúc Next.js App Router (Routing & Pages)
├── components/
│   ├── ui/               # Các component nguyên tử từ Shadcn UI
│   ├── layout/           # Component cấu trúc (Sidebar, Header, Layout chung)
│   └── common/           # Component dùng chung toàn dự án
├── features/             # Module nghiệp vụ chuyên biệt
│   ├── dashboard/        # Báo cáo thống kê, biểu đồ Recharts
│   ├── diagnosis/        # Giao diện chẩn đoán, tải ảnh, slider Grad-CAM
│   ├── patients/         # Quản lý danh sách, hồ sơ bệnh nhân
│   ├── results/          # Tra cứu lịch sử chẩn đoán, xuất PDF
│   └── knowledge/        # Chatbot y tế và tài liệu lâm sàng
├── lib/                  # Cấu hình tiện ích (Axios client, utils)
├── store/                # Cấu hình Redux Store và các Slices trạng thái
└── types/                # Định nghĩa kiểu dữ liệu TypeScript toàn cục
```

### 💻 Hướng Dẫn Cài Đặt

**1. Yêu cầu hệ thống:**
- Đã cài đặt [Node.js](https://nodejs.org/) (Khuyến nghị phiên bản LTS v20 trở lên)
- Trình quản lý gói `npm` (đi kèm Node.js)

**2. Clone dự án và cài đặt thư viện:**
```bash
git clone https://github.com/Tienkun2/Pneumonia-FE.git
cd Pneumonia-FE
npm install
```

**3. Cấu hình biến môi trường:**
Tạo file `.env.local` ở thư mục gốc của dự án và cấu hình các biến sau:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

**4. Chạy ứng dụng:**
- **Chế độ phát triển (Development):**
  ```bash
  npm run dev
  ```
  Truy cập ứng dụng tại: [http://localhost:3000](http://localhost:3000)

- **Biên dịch sản phẩm (Production Build):**
  ```bash
  npm run build
  npm run start
  ```

---

## 🇬🇧 English

The Frontend user interface of the **Pneumonia Diagnosis Clinical Decision Support System (CDSS)**. Built with **Next.js 15 (App Router)** and **TypeScript**, it provides clinicians with an intuitive, modern, and real-time dashboard integrated with AI diagnostic models and Backend services.

### 🚀 Key Features

1. **Multimodal Diagnostic Workspace**:
   - High-performance chest X-ray image uploader (`react-dropzone`).
   - 10-symptom clinical checklist mapping.
   - Interactive **CURB-65** clinical calculator.
   - Interactive slider and overlay switch for comparing raw X-rays with **Grad-CAM** thermal maps.
2. **Intelligent Report Generation**:
   - Renders generative medical reports from the GenAI LLM.
   - One-click copy/apply feature to import the AI report directly into the Doctor's clinical notes.
   - Rich text editing and native **PDF** export & direct printing support.
3. **Patient Registry & History (Patient CRUD)**:
   - Register, search, and manage patient demographic records.
   - Access comprehensive historic clinical visits and historical diagnosis details.
   - Historical PDF reprint support.
4. **Clinical Assistant Chatbot**:
   - Real-time conversational interface connected to the fine-tuned respiratory LLM.
   - Swift lookups for Ministry of Health CAP guidelines, atypical/typical pneumonia differentiation, and clinical scoring rules.
5. **Interactive Dashboard**:
   - Visual statistics tracking pneumonia risk demographics (Low, Medium, High) and case counts via **Recharts**.

### 🛠️ Tech Stack

- **Core Framework**: Next.js 15 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (via PostCSS configuration)
- **UI Components**: Shadcn/UI (Radix UI Primitives foundation)
- **State Management**: Redux Toolkit & React Redux
- **Form Management**: React Hook Form with Zod schema validation
- **Data Querying**: TanStack Query (React Query) & Axios
- **Real-Time Messaging**: WebSockets (`@stomp/stompjs` & `sockjs-client`)
- **Document Export**: `jspdf` & `html2canvas` for PDF and printing utilities

### 📂 Directory Structure

```text
src/
├── app/                  # Next.js App Router (Routes & Pages)
├── components/
│   ├── ui/               # Core design elements from Shadcn UI
│   ├── layout/           # Shell elements (Sidebar, Header, Layout)
│   └── common/           # Shared general components
├── features/             # Modularized feature folders
│   ├── dashboard/        # Analytical charts (Recharts)
│   ├── diagnosis/        # Diagnosis panel, X-ray upload, Grad-CAM slider
│   ├── patients/         # Patient management panels
│   ├── results/          # Historic results logs, PDF generation
│   └── knowledge/        # Medical chatbot and clinical docs
├── lib/                  # Configuration & utilities (Axios instance, helpers)
├── store/                # Redux state configuration and slices
└── types/                # Global TypeScript definitions
```

### 💻 Installation & Local Run

**1. Prerequisites:**
- [Node.js](https://nodejs.org/) (LTS v20+ recommended)
- `npm` package manager (comes preinstalled with Node.js)

**2. Setup Repository:**
```bash
git clone https://github.com/Tienkun2/Pneumonia-FE.git
cd Pneumonia-FE
npm install
```

**3. Setup Environment Variables:**
Create a `.env.local` file at the root folder of the project:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

**4. Start Server:**
- **Development Server:**
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) on your local browser.

- **Build and Start Production Server:**
  ```bash
  npm run build
  npm run start
  ```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
