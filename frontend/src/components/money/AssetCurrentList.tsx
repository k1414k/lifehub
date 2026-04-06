"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatRecordedOn,
  formatSignedCurrency,
  type AssetItemSummary,
} from "@/lib/assets";
import type { AssetItem } from "@/types";

interface Props {
  items: AssetItemSummary[];
  selectedAssetId: number | null;
  onSelect: (assetId: number) => void;
  onEdit: (asset: AssetItem) => void;
  onDelete: (asset: AssetItem) => void;
}

export default function AssetCurrentList({
  items,
  selectedAssetId,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">最新の資産項目一覧</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">現在値、前回比、最終記録日を一覧で確認できます</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-500">
          資産項目を追加すると、ここに現在値が表示されます
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const isSelected = item.asset.id === selectedAssetId;

            return (
              <div
                key={item.asset.id}
                onClick={() => onSelect(item.asset.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(item.asset.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`h-full rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-brand-300 bg-brand-50/40 shadow-sm dark:bg-brand-500/10"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-950"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.asset.name}</p>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.asset.description || "説明はまだ登録されていません"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(item.asset);
                      }}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                      aria-label={`${item.asset.name} を編集`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(item.asset);
                      }}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-white hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      aria-label={`${item.asset.name} を削除`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">現在値</p>
                    <p className="amount-text mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.currentValue == null ? "未記録" : formatCurrency(item.currentValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">前回比</p>
                    <p
                      className={`amount-text mt-1 text-sm font-semibold ${
                        item.change == null
                          ? "text-slate-500 dark:text-slate-300"
                          : item.change >= 0
                            ? "text-emerald-600"
                            : "text-red-500"
                      }`}
                    >
                      {formatSignedCurrency(item.change)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">最終記録日</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.latestSnapshot ? formatRecordedOn(item.latestSnapshot.recorded_on) : "未記録"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
