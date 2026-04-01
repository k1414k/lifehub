"use client";

import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { useTransactions, useDeleteTransaction } from "@/hooks/useApi";

export default function TransactionList() {
  const { data: transactions = [], isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  if (isLoading) return <div className="card animate-pulse h-40" />;

  return (
    <div className="card p-0 overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-800">取引履歴</h2>
      </div>
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-slate-400">
          まだ記録がありません
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((t) => (
            <li key={t.id} className="group flex items-start gap-3 px-4 py-4 hover:bg-slate-50 sm:items-center sm:gap-4 sm:px-6 sm:py-3">
              <div className={`p-1.5 rounded-lg ${t.transaction_type === "income" ? "bg-emerald-50" : "bg-red-50"}`}>
                {t.transaction_type === "income"
                  ? <ArrowUpRight size={16} className="text-emerald-600" />
                  : <ArrowDownRight size={16} className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                <p className="text-xs text-slate-400">{t.category} · {t.date}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                <p className={`text-sm font-semibold tabular-nums ${t.transaction_type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                  {t.transaction_type === "income" ? "+" : "-"}¥{Number(t.amount).toLocaleString()}
                </p>
                <button
                  onClick={() => deleteMutation.mutate(t.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg p-1.5 transition-all hover:bg-red-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`${t.title} を削除`}
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
