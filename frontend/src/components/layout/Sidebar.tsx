"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  StickyNote,
  FolderOpen,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/money",      label: "資産管理",       icon: Wallet },
  { href: "/memos",      label: "メモ",           icon: StickyNote },
  { href: "/files",      label: "ファイル管理",   icon: FolderOpen },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/30 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-100 bg-white transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 sm:px-6">
          <span className="font-display text-xl font-bold text-brand-600">LifeHub</span>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="メニューを閉じる"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150 sm:py-2.5 ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"}
                />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-brand-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 sm:py-2.5"
          >
            <Settings size={18} className="text-slate-400" />
            設定
          </Link>
        </div>
      </aside>
    </>
  );
}
