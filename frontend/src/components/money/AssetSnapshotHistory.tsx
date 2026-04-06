"use client";

import { useMemo, useState } from "react";
import { parseISO, subDays, subMonths, subYears } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import {
  buildSnapshotChangeMap,
  formatCurrency,
  formatDateTime,
  formatRecordedOn,
  formatSignedCurrency,
} from "@/lib/assets";
import type { AssetItem, AssetSnapshot } from "@/types";

type HistoryRange = "30D" | "3M" | "1Y" | "ALL";

interface Props {
  snapshots: AssetSnapshot[];
  assetsById: Map<number, AssetItem>;
  onEdit: (snapshot: AssetSnapshot) => void;
  onDelete: (snapshot: AssetSnapshot) => void;
}

const HISTORY_RANGE_OPTIONS: Array<{ value: HistoryRange; label: string }> = [
  { value: "30D", label: "30日" },
  { value: "3M", label: "3ヶ月" },
  { value: "1Y", label: "1年" },
  { value: "ALL", label: "すべて" },
];

function getHistoryRangeStart(range: HistoryRange, latestSnapshot: AssetSnapshot | null) {
  if (!latestSnapshot || range === "ALL") return null;

  const endDate = parseISO(latestSnapshot.recorded_on);

  if (range === "30D") return subDays(endDate, 30);
  if (range === "3M") return subMonths(endDate, 3);
  return subYears(endDate, 1);
}

export default function AssetSnapshotHistory({
  snapshots,
  assetsById,
  onEdit,
  onDelete,
}: Props) {
  const [selectedAssetId, setSelectedAssetId] = useState<number | "all">("all");
  const [selectedRange, setSelectedRange] = useState<HistoryRange>("3M");
  const changeMap = useMemo(() => buildSnapshotChangeMap(snapshots), [snapshots]);
  const assetFilterOptions = useMemo(
    () =>
      [...assetsById.values()]
        .sort((a, b) => a.name.localeCompare(b.name, "ja"))
        .map((asset) => ({ id: asset.id, name: asset.name })),
    [assetsById]
  );
  const filteredSnapshots = useMemo(() => {
    const latestSnapshot = snapshots[0] ?? null;
    const rangeStart = getHistoryRangeStart(selectedRange, latestSnapshot);

    return snapshots.filter((snapshot) => {
      if (selectedAssetId !== "all" && snapshot.asset_item_id !== selectedAssetId) {
        return false;
      }

      if (!rangeStart) return true;
      return parseISO(snapshot.recorded_on) >= rangeStart;
    });
  }, [selectedAssetId, selectedRange, snapshots]);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-800">記録履歴</h2>
        <p className="mt-1 text-sm text-slate-500">時系列の評価額記録を編集・削除できます</p>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500">項目で絞り込み</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedAssetId("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedAssetId === "all"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                すべて
              </button>
              {assetFilterOptions.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedAssetId === asset.id
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-100 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {asset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">期間</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {HISTORY_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRange(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedRange === option.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          まだスナップショットがありません
        </div>
      ) : filteredSnapshots.length === 0 ? (
        <div className="flex h-32 items-center justify-center px-4 text-center text-sm text-slate-400">
          条件に一致する記録はありません
        </div>
      ) : (
        <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
          {filteredSnapshots.map((snapshot) => {
            const assetName = assetsById.get(snapshot.asset_item_id)?.name ?? "削除済みの資産";
            const change = changeMap.get(snapshot.id) ?? null;
            const changeText =
              change == null ? "—" : change === 0 ? "0円" : formatSignedCurrency(change);
            const changeClass =
              change == null
                ? "text-slate-400"
                : change > 0
                  ? "text-emerald-600"
                  : change < 0
                    ? "text-red-500"
                    : "text-slate-500";

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
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-500">
                    {snapshot.note?.trim() ? snapshot.note : "メモなし"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    最終更新: {formatDateTime(snapshot.updated_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:min-w-44 sm:justify-end">
                  <div className="text-right">
                    <p className="amount-text text-sm font-semibold text-slate-900">
                      {formatCurrency(Number(snapshot.amount))}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${changeClass}`}>
                      前回比 {changeText}
                    </p>
                  </div>
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
