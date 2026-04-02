"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDateTime, formatRecordedOn } from "@/lib/assets";
import type { AssetItem, AssetSnapshot } from "@/types";

interface Props {
  snapshots: AssetSnapshot[];
  assetsById: Map<number, AssetItem>;
  onEdit: (snapshot: AssetSnapshot) => void;
  onDelete: (snapshot: AssetSnapshot) => void;
}

export default function AssetSnapshotHistory({
  snapshots,
  assetsById,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-800">記録履歴</h2>
        <p className="mt-1 text-sm text-slate-500">時系列の評価額記録を編集・削除できます</p>
      </div>

      {snapshots.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          まだスナップショットがありません
        </div>
      ) : (
        <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
          {snapshots.map((snapshot) => {
            const assetName = assetsById.get(snapshot.asset_item_id)?.name ?? "削除済みの資産";

            return (
              <li
                key={snapshot.id}
                className="flex flex-col gap-3 px-4 py-4 hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{assetName}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {formatRecordedOn(snapshot.recorded_on)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {snapshot.note?.trim() ? snapshot.note : "メモなし"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    最終更新: {formatDateTime(snapshot.updated_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="amount-text text-sm font-semibold text-slate-900">
                    {formatCurrency(Number(snapshot.amount))}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(snapshot)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                      aria-label={`${assetName} の記録を編集`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(snapshot)}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-white hover:text-red-600"
                      aria-label={`${assetName} の記録を削除`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
