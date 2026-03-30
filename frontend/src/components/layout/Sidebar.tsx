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
} from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/money",      label: "お金管理",       icon: Wallet },
  { href: "/memos",      label: "メモ",           icon: StickyNote },
  { href: "/files",      label: "ファイル管理",   icon: FolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-100 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <span className="font-display font-bold text-xl text-brand-600">LifeHub</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${active
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

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
        >
          <Settings size={18} className="text-slate-400" />
          設定
        </Link>
      </div>
    </aside>
  );
}
