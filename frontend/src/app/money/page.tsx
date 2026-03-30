"use client";

import { useState, useMemo } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import TransactionList from "@/components/money/TransactionList";
import TransactionModal from "@/components/money/TransactionModal";
import MoneyChart from "@/components/money/MoneyChart";
import { useTransactions } from "@/hooks/useApi";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export default function MoneyPage() {
  const [open, setOpen] = useState(false);
  const { data: transactions = [] } = useTransactions();
  const now = new Date();

  const summary = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const inMonth = transactions.filter((t) =>
      isWithinInterval(new Date(t.date), { start, end })
    );
    const income  = inMonth.filter((t) => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = inMonth.filter((t) => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">お金管理</h1>
          <p className="text-sm text-slate-500 mt-1">収支を記録・可視化</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={16} /> 記録を追加
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-start gap-4">
          <div className="p-2 rounded-xl bg-emerald-50"><TrendingUp size={20} className="text-emerald-600" /></div>
          <div>
            <p className="text-xs font-medium text-slate-500">今月の収入</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-0.5">¥{summary.income.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-start gap-4">
          <div className="p-2 rounded-xl bg-red-50"><TrendingDown size={20} className="text-red-500" /></div>
          <div>
            <p className="text-xs font-medium text-slate-500">今月の支出</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-0.5">¥{summary.expense.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-start gap-4">
          <div className="p-2 rounded-xl bg-brand-50"><Wallet size={20} className="text-brand-600" /></div>
          <div>
            <p className="text-xs font-medium text-slate-500">残高</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-0.5">¥{summary.balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <MoneyChart />
      <TransactionList />
      <TransactionModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
