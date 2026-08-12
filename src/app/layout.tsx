import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "أستاذي - مساعد المعلم",
  description: "لوحة تحكم إدارة السناتر التعليمية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} antialiased dark`}>
      <body className="min-h-screen bg-[#0B1120] text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
