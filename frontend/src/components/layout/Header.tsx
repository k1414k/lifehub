"use client";

import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-2">
        <button className="btn-ghost p-2 rounded-xl">
          <Bell size={18} className="text-slate-500" />
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
            <User size={16} className="text-brand-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">ユーザー</span>
        </button>
      </div>
    </header>
  );
}
