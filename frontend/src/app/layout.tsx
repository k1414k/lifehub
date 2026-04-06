import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { Suspense } from "react";
import AuthProvider from "@/components/auth/AuthProvider";
import QueryProvider from "@/components/QueryProvider";
import ThemeProvider from "@/components/theme/ThemeProvider";
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
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">
                  読み込み中...
                </div>
              }
            >
              <AuthProvider>{children}</AuthProvider>
            </Suspense>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
