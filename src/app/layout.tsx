import { AppProvider } from "@/components/layout/app-provider";
import "./globals.css";

export const metadata = {
  title: "Phòng Khám Phổi Nhi Đồng - CDSS",
  description: "Hệ thống hỗ trợ chẩn đoán phổi cho trẻ em (1-5 tuổi)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
