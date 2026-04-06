"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useActivityLogStore } from "@/stores/activityLogStore";
import { useAuthStore } from "@/stores/authStore";

const pageLabels: Record<string, string> = {
  "/dashboard": "ダッシュボード",
  "/money": "資産管理",
  "/memos": "メモ",
  "/files": "ファイル管理",
  "/settings": "設定",
};

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const activityItems = useActivityLogStore((state) => state.items);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const activityRef = useRef<HTMLDivElement | null>(null);
  const currentLabel =
    Object.entries(pageLabels).find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ??
    "LifeHub";

  useEffect(() => {
    setActivityOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!activityOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!activityRef.current?.contains(event.target as Node)) {
        setActivityOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [activityOpen]);

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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
          aria-label="メニューを開く"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">{currentLabel}</p>
          <p className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">LifeHub</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative" ref={activityRef}>
          <button
            type="button"
            onClick={() => setActivityOpen((current) => !current)}
            className="btn-ghost relative rounded-xl p-2"
            aria-label="最近の操作を表示"
          >
            <Bell size={18} className="text-slate-500 dark:text-slate-200" />
            {activityItems.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
            )}
          </button>
          {activityOpen && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    最近の操作
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    新しい順に最大4件まで表示します
                  </p>
                </div>
              </div>
              {activityItems.length === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  まだ操作履歴はありません
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {activityItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {item.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {new Date(item.created_at).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 sm:px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/15">
            <User size={16} className="text-brand-600 dark:text-brand-300" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-100">{user?.name ?? "ユーザー"}</p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.email ?? "ログイン中"}</p>
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
