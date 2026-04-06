"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { Layers3, PencilLine, RotateCcw } from "lucide-react";
import {
  formatCurrency,
  type AssetItemSummary,
} from "@/lib/assets";
import { getApiErrorMessage } from "@/lib/api";
import {
  useCreateAssetSnapshot,
  useCreateAssetSnapshotBatch,
  useUpdateAssetSnapshot,
} from "@/hooks/useApi";
import { useActivityLogStore } from "@/stores/activityLogStore";
import type { AssetItem, AssetSnapshot } from "@/types";

const singleSchema = z.object({
  asset_item_id: z.string().min(1, "資産項目を選択してください"),
  amount: z
    .string()
    .min(1, "金額は必須です")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "金額は0以上で入力してください",
    }),
  recorded_on: z.string().min(1, "日付は必須です"),
  note: z.string().optional(),
});

type SingleSnapshotValues = z.infer<typeof singleSchema>;

type FormMode = "single" | "batch";

interface Props {
  assets: AssetItem[];
  assetSummaries: AssetItemSummary[];
  editingSnapshot: AssetSnapshot | null;
  onEditingSnapshotChange: (snapshot: AssetSnapshot | null) => void;
}

function todayString() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function AssetSnapshotForm({
  assets,
  assetSummaries,
  editingSnapshot,
  onEditingSnapshotChange,
}: Props) {
  const createMutation = useCreateAssetSnapshot();
  const updateMutation = useUpdateAssetSnapshot();
  const batchMutation = useCreateAssetSnapshotBatch();
  const addActivity = useActivityLogStore((state) => state.addItem);
  const [mode, setMode] = useState<FormMode>("single");
  const [batchDate, setBatchDate] = useState(todayString());
  const [batchNote, setBatchNote] = useState("");
  const [batchValues, setBatchValues] = useState<Record<number, string>>({});
  const [batchError, setBatchError] = useState<string | null>(null);
  const summaryById = useMemo(
    () => new Map(assetSummaries.map((summary) => [summary.asset.id, summary])),
    [assetSummaries]
  );
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<SingleSnapshotValues>({
    resolver: zodResolver(singleSchema),
    defaultValues: {
      asset_item_id: "",
      amount: "",
      recorded_on: todayString(),
      note: "",
    },
  });

  useEffect(() => {
    setBatchValues((current) => {
      const next: Record<number, string> = {};

      for (const asset of assets) {
        next[asset.id] = current[asset.id] ?? "";
      }

      return next;
    });
  }, [assets]);

  useEffect(() => {
    if (editingSnapshot) {
      setMode("single");
      reset({
        asset_item_id: String(editingSnapshot.asset_item_id),
        amount: String(Number(editingSnapshot.amount)),
        recorded_on: editingSnapshot.recorded_on,
        note: editingSnapshot.note ?? "",
      });
      return;
    }

    const currentValues = getValues();
    const selectedAssetId = currentValues.asset_item_id;
    const hasSelectedAsset = assets.some((asset) => String(asset.id) === selectedAssetId);

    reset({
      asset_item_id: hasSelectedAsset ? selectedAssetId : assets[0] ? String(assets[0].id) : "",
      amount: "",
      recorded_on: currentValues.recorded_on || todayString(),
      note: "",
    });
  }, [assets, editingSnapshot, getValues, reset]);

  const handleSingleSubmit = async (values: SingleSnapshotValues) => {
    const payload = {
      asset_item_id: Number(values.asset_item_id),
      amount: Number(values.amount),
      recorded_on: values.recorded_on,
      note: values.note?.trim() || undefined,
    };

    if (editingSnapshot) {
      await updateMutation.mutateAsync({
        id: editingSnapshot.id,
        data: payload,
      });
      const assetName = summaryById.get(payload.asset_item_id)?.asset.name ?? "資産";
      addActivity(`${assetName} の記録を更新しました`);
      onEditingSnapshotChange(null);
    } else {
      await createMutation.mutateAsync(payload);
      const assetName = summaryById.get(payload.asset_item_id)?.asset.name ?? "資産";
      addActivity(`${assetName} を記録しました`);
    }

    reset({
      asset_item_id: values.asset_item_id,
      amount: "",
      recorded_on: values.recorded_on,
      note: "",
    });
  };

  const handleBatchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBatchError(null);

    const items = assets
      .map((asset) => ({
        asset_item_id: asset.id,
        amount: batchValues[asset.id]?.trim() ?? "",
      }))
      .filter((item) => item.amount !== "")
      .map((item) => ({
        asset_item_id: item.asset_item_id,
        amount: Number(item.amount),
      }));

    if (!batchDate) {
      setBatchError("記録日を入力してください");
      return;
    }

    if (items.length === 0) {
      setBatchError("一括記録する資産項目を1つ以上入力してください");
      return;
    }

    if (items.some((item) => Number.isNaN(item.amount) || item.amount < 0)) {
      setBatchError("金額は0以上で入力してください");
      return;
    }

    await batchMutation.mutateAsync({
      recorded_on: batchDate,
      note: batchNote.trim() || undefined,
      items,
    });
    addActivity(`${items.length}件の資産を一括記録しました`);

    setBatchValues({});
    setBatchNote("");
  };

  const singleError = createMutation.error || updateMutation.error;

  return (
    <div id="snapshot-recorder" className="card">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">スナップショットを記録</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            単一更新と一括記録の両方に対応しています
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { id: "single" as const, label: "単一更新", icon: PencilLine },
            { id: "batch" as const, label: "一括記録", icon: Layers3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50" : "text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-50"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {mode === "single" ? (
          <form onSubmit={handleSubmit(handleSingleSubmit)} className="space-y-4">
            {editingSnapshot && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/10">
                <div>
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-200">履歴を編集中です</p>
                  <p className="mt-1 text-xs text-brand-600 dark:text-brand-300">
                    保存すると、この記録の金額と日付が更新されます
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditingSnapshotChange(null)}
                  className="btn-ghost px-3 py-2"
                >
                  <RotateCcw size={14} />
                  編集をやめる
                </button>
              </div>
            )}

            <div>
              <label className="label">資産項目</label>
              <select
                className="input"
                {...register("asset_item_id")}
                disabled={assets.length === 0 || Boolean(editingSnapshot)}
              >
                <option value="">選択してください</option>
                {assetSummaries.map((summary) => (
                  <option key={summary.asset.id} value={summary.asset.id}>
                    {summary.asset.name}
                  </option>
                ))}
              </select>
              {errors.asset_item_id && (
                <p className="mt-1 text-xs text-red-500">{errors.asset_item_id.message}</p>
              )}
              {editingSnapshot && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">編集中は資産項目自体の付け替えはできません。</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">金額（円）</label>
                <input type="number" className="input" placeholder="0" {...register("amount")} />
                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="label">記録日</label>
                <input type="date" className="input" {...register("recorded_on")} />
                {errors.recorded_on && (
                  <p className="mt-1 text-xs text-red-500">{errors.recorded_on.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">メモ（任意）</label>
              <textarea
                className="input"
                rows={2}
                placeholder="評価基準やメモなど"
                {...register("note")}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">現在値の参考</p>
              <div className="mt-2 space-y-2">
                {assetSummaries.map((summary) => (
                  <div key={summary.asset.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{summary.asset.name}</span>
                    <span className="amount-text font-medium text-slate-900 dark:text-slate-100">
                      {summary.currentValue == null ? "未記録" : formatCurrency(summary.currentValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {singleError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {getApiErrorMessage(singleError)}
              </p>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || assets.length === 0}
              className="btn-primary w-full justify-center"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "保存中..."
                : editingSnapshot
                  ? "記録を更新する"
                  : "記録を保存する"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">記録日</label>
                <input
                  type="date"
                  className="input"
                  value={batchDate}
                  onChange={(event) => setBatchDate(event.target.value)}
                />
              </div>
              <div>
                <label className="label">共通メモ（任意）</label>
                <input
                  className="input"
                  placeholder="例：月末の棚卸し"
                  value={batchNote}
                  onChange={(event) => setBatchNote(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              {assets.map((asset) => {
                const summary = summaryById.get(asset.id);

                return (
                  <div key={asset.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{asset.name}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          現在値:{" "}
                          <span className="amount-text">
                            {summary?.currentValue == null ? "未記録" : formatCurrency(summary.currentValue)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <input
                      type="number"
                      className="input"
                      placeholder="空欄なら今回の一括記録から除外"
                      value={batchValues[asset.id] ?? ""}
                      onChange={(event) =>
                        setBatchValues((current) => ({
                          ...current,
                          [asset.id]: event.target.value,
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>

            {batchError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{batchError}</p>
            )}
            {batchMutation.error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {getApiErrorMessage(batchMutation.error)}
              </p>
            )}

            <p className="text-xs text-slate-400 dark:text-slate-500">空欄の資産項目は今回の一括記録では更新しません。</p>

            <button
              type="submit"
              disabled={batchMutation.isPending || assets.length === 0}
              className="btn-primary w-full justify-center"
            >
              {batchMutation.isPending ? "保存中..." : "一括で記録する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
