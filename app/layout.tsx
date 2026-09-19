import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Exam Centre",
  description: "ระบบเข้าสู่ระบบเพื่อเข้าสอบตามตารางเวลาสำหรับโรงเรียนมัธยม",
};

export const viewport = {
  themeColor: "#047eef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
