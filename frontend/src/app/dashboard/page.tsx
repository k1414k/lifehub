"use client";

import { useTransactions, useMemos, useFiles } from "@/hooks/useApi";
import { TrendingUp, TrendingDown, Wallet, StickyNote, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ja } from "date-fns/locale";

export default function DashboardPage() {
  const { data: transactions = [] } = useTransactions();
  const { data: memos = [] } = useMemos();
  const { data: files = [] } = useFiles();
  const now = new Date();

  const thisMonth = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const inMonth = transactions.filter((t) =>
      isWithinInterval(new Date(t.date), { start, end })
    );
    const income  = inMonth.filter((t) => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = inMonth.filter((t) => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const chartData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const inMonth = transactions.filter((t) =>
        isWithinInterval(new Date(t.date), { start, end })
      );
      return {
        month:   format(d, "M月", { locale: ja }),
        income:  inMonth.filter((t) => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: inMonth.filter((t) => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    }),
  [transactions]);

  const recentTransactions = transactions.slice(0, 5);
  const pinnedMemos = memos.filter((m) => m.pinned).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">ダッシュボード</h1>
        <p className="text-sm text-slate-500 mt-1">{format(now, "yyyy年M月d日（E）", { locale: ja })}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "今月の収入", value: `¥${thisMonth.income.toLocaleString()}`,   icon: <TrendingUp size={18} />,  color: "bg-emerald-50 text-emerald-600" },
          { label: "今月の支出", value: `¥${thisMonth.expense.toLocaleString()}`,  icon: <TrendingDown size={18} />, color: "bg-red-50 text-red-500" },
          { label: "今月の残高", value: `¥${thisMonth.balance.toLocaleString()}`,  icon: <Wallet size={18} />,      color: "bg-brand-50 text-brand-600" },
          { label: "メモ / ファイル", value: `${memos.length} / ${files.length}`, icon: <StickyNote size={18} />,  color: "bg-violet-50 text-violet-600" },
        ].map((c) => (
          <div key={c.label} className="card flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shrink-0 ${c.color}`}>{c.icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">{c.label}</p>
              <p className="text-xl font-display font-bold text-slate-900 mt-0.5 tabular-nums">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card lg:col-span-3">
          <h2 className="font-semibold text-slate-800 mb-4">収支推移（6ヶ月）</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v === 0 ? "0" : `¥${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`¥${v.toLocaleString()}`, ""]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="income"  name="収入" stroke="#10b981" strokeWidth={2} fill="url(#gi)" />
              <Area type="monotone" dataKey="expense" name="支出" stroke="#f87171" strokeWidth={2} fill="url(#ge)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">最近の取引</h2>
            <Link href="/money" className="text-xs text-brand-600 hover:underline flex items-center gap-1">すべて <ArrowRight size={12} /></Link>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">取引がありません</p>
          ) : (
            <ul className="space-y-2">
              {recentTransactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.category}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ml-3 shrink-0 ${t.transaction_type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                    {t.transaction_type === "income" ? "+" : "-"}¥{Number(t.amount).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {pinnedMemos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">ピン留めメモ</h2>
            <Link href="/memos" className="text-xs text-brand-600 hover:underline flex items-center gap-1">すべて <ArrowRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pinnedMemos.map((m) => (
              <Link key={m.id} href="/memos" className="card hover:shadow-card-hover transition-shadow block">
                <p className="text-sm font-semibold text-slate-800 truncate">{m.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.content || "内容なし"}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/money", label: "お金を記録する", icon: <Wallet size={20} />,    color: "bg-emerald-50 text-emerald-600" },
          { href: "/memos", label: "メモを書く",     icon: <StickyNote size={20} />, color: "bg-violet-50 text-violet-600" },
          { href: "/files", label: "ファイルを管理", icon: <FolderOpen size={20} />, color: "bg-brand-50 text-brand-600" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group">
            <div className={`p-2.5 rounded-xl ${item.color}`}>{item.icon}</div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
            <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
