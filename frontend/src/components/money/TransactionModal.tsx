"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { useCreateTransaction } from "@/hooks/useApi";
import type { TransactionForm } from "@/types";

const schema = z.object({
  title:            z.string().min(1, "タイトルは必須です"),
  amount:           z.coerce.number().min(1, "金額は1以上"),
  transaction_type: z.enum(["income", "expense"]),
  category:         z.string().min(1, "カテゴリは必須です"),
  date:             z.string().min(1, "日付は必須です"),
  note:             z.string().optional(),
});

const EXPENSE_CATEGORIES = ["食費", "交通費", "光熱費", "娯楽", "医療", "その他"];
const INCOME_CATEGORIES  = ["給与", "副業", "投資", "その他"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TransactionModal({ open, onClose }: Props) {
  const createMutation = useCreateTransaction();
  const {
    register, handleSubmit, watch, reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      transaction_type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const type = watch("transaction_type");
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = async (data: TransactionForm) => {
    await createMutation.mutateAsync(data);
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">取引を追加</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {(["expense", "income"] as const).map((t) => (
              <label key={t} className={`flex-1 text-center py-2 text-sm font-medium cursor-pointer transition-colors
                ${watch("transaction_type") === t
                  ? (t === "income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")
                  : "text-slate-500 hover:bg-slate-50"}`}>
                <input type="radio" value={t} {...register("transaction_type")} className="sr-only" />
                {t === "expense" ? "支出" : "収入"}
              </label>
            ))}
          </div>

          <div>
            <label className="label">タイトル</label>
            <input className="input" placeholder="例：ランチ" {...register("title")} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">金額 (¥)</label>
              <input type="number" className="input" placeholder="0" {...register("amount")} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="label">日付</label>
              <input type="date" className="input" {...register("date")} />
            </div>
          </div>

          <div>
            <label className="label">カテゴリ</label>
            <select className="input" {...register("category")}>
              <option value="">選択</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="label">メモ（任意）</label>
            <textarea className="input" rows={2} placeholder="備考など" {...register("note")} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">キャンセル</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
              {createMutation.isPending ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
