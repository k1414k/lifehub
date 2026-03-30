import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import QueryProvider from "@/components/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LifeHub — 生活管理ツール",
  description: "お金・メモ・ファイルをシンプルに管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} font-sans`}>
          <QueryProvider>{children}</QueryProvider>
        </body>
    </html>
  );
}
