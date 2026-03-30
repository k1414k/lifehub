"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTransactions } from "@/hooks/useApi";
import { useMemo } from "react";
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, format } from "date-fns";
import { ja } from "date-fns/locale";

export default function MoneyChart() {
  const { data: transactions = [] } = useTransactions();
  const now = new Date();

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

  return (
    <div className="card">
      <h2 className="font-semibold text-slate-800 mb-4">月別収支</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}
            tickFormatter={(v) => v === 0 ? "0" : `¥${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, ""]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income"  name="収入" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="支出" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
