"use client";

import { useState } from "react";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const pageLabels: Record<string, string> = {
  "/dashboard": "ダッシュボード",
  "/money": "資産管理",
  "/memos": "メモ",
  "/files": "ファイル管理",
};

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const currentLabel =
    Object.entries(pageLabels).find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ??
    "LifeHub";

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await api.delete("/auth/sign_out", { skipAuthRedirect: true });
    } catch {
      // ネットワーク失敗時でもクライアント側の認証状態は必ず破棄する
    } finally {
      clearSession();
      router.replace("/auth/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="メニューを開く"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{currentLabel}</p>
          <p className="hidden text-xs text-slate-400 sm:block">LifeHub</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button className="btn-ghost rounded-xl p-2">
          <Bell size={18} className="text-slate-500" />
        </button>
        <div className="flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50 sm:px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
            <User size={16} className="text-brand-600" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-slate-700">{user?.name ?? "ユーザー"}</p>
            <p className="truncate text-xs text-slate-400">{user?.email ?? "ログイン中"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="btn-ghost rounded-xl px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            <LogOut size={16} />
            <span className="hidden sm:inline">{isLoggingOut ? "ログアウト中..." : "ログアウト"}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
