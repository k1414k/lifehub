"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import AssetCurrentList from "@/components/money/AssetCurrentList";
import AssetItemModal from "@/components/money/AssetItemModal";
import AssetSnapshotForm from "@/components/money/AssetSnapshotForm";
import AssetSnapshotHistory from "@/components/money/AssetSnapshotHistory";
import PortfolioChart from "@/components/money/PortfolioChart";
import {
  useAssets,
  useAssetSnapshots,
  useDeleteAsset,
  useDeleteAssetSnapshot,
} from "@/hooks/useApi";
import {
  buildAssetChartTargetKey,
  buildAssetChartPoints,
  buildAssetItemSummaries,
  buildPortfolioSummary,
  buildTotalChartPoints,
  calculateAssetShare,
  DEFAULT_ASSET_CHART_RANGE,
  DEFAULT_ASSET_CHART_TARGET_KEY,
  formatCurrency,
  formatDateTime,
  formatRecordedOn,
  formatSharePercentage,
  formatSignedCurrency,
  parseAssetIdFromChartTargetKey,
  sortSnapshotsRecentFirst,
  type AssetChartRange,
  type AssetChartTargetKey,
  TOTAL_ASSET_CHART_TARGET_KEY,
} from "@/lib/assets";
import {
  DEFAULT_MONEY_CHART_PREFERENCES,
  loadMoneyChartPreferences,
  saveMoneyChartPreferences,
} from "@/lib/moneyChartPreferences";
import type { AssetItem, AssetSnapshot } from "@/types";

interface ChartTargetOption {
  key: AssetChartTargetKey;
  label: string;
  shareLabel: string;
  currentValue: number | null;
  change: number | null;
  lastUpdatedAt: string | null;
  lastRecordedOn: string | null;
  description: string;
}

export default function MoneyPage() {
  const assetsQuery = useAssets();
  const snapshotsQuery = useAssetSnapshots();
  const assets = assetsQuery.data ?? [];
  const snapshots = snapshotsQuery.data ?? [];
  const deleteAssetMutation = useDeleteAsset();
  const deleteSnapshotMutation = useDeleteAssetSnapshot();
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [editingSnapshot, setEditingSnapshot] = useState<AssetSnapshot | null>(null);
  const [selectedTargetKey, setSelectedTargetKey] = useState<AssetChartTargetKey>(
    DEFAULT_ASSET_CHART_TARGET_KEY
  );
  const [selectedRange, setSelectedRange] = useState<AssetChartRange>(DEFAULT_ASSET_CHART_RANGE);
  const [defaultPreferences, setDefaultPreferences] = useState(DEFAULT_MONEY_CHART_PREFERENCES);
  const [hasHydratedPreferences, setHasHydratedPreferences] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const assetSummaries = useMemo(
    () => buildAssetItemSummaries(assets, snapshots),
    [assets, snapshots]
  );
  const portfolioSummary = useMemo(
    () => buildPortfolioSummary(assets, snapshots),
    [assets, snapshots]
  );
  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets]
  );
  const assetNamesById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset.name])),
    [assets]
  );
  const recentSnapshots = useMemo(
    () => sortSnapshotsRecentFirst(snapshots),
    [snapshots]
  );
  const validTargetKeys = useMemo<AssetChartTargetKey[]>(
    () => [TOTAL_ASSET_CHART_TARGET_KEY, ...assetSummaries.map((summary) => buildAssetChartTargetKey(summary.asset.id))],
    [assetSummaries]
  );
  const selectedAssetId = useMemo(
    () => parseAssetIdFromChartTargetKey(selectedTargetKey),
    [selectedTargetKey]
  );

  useEffect(() => {
    if (assetsQuery.isLoading) return;

    const preferences = loadMoneyChartPreferences(validTargetKeys);
    setDefaultPreferences(preferences);

    if (!hasHydratedPreferences) {
      setSelectedTargetKey(preferences.defaultTargetKey);
      setSelectedRange(preferences.defaultRange);
      setHasHydratedPreferences(true);
      return;
    }

    setSelectedTargetKey((current) =>
      validTargetKeys.includes(current) ? current : preferences.defaultTargetKey
    );
  }, [assetsQuery.isLoading, hasHydratedPreferences, validTargetKeys]);

  useEffect(() => {
    if (!savedMessage) return;

    const timeoutId = window.setTimeout(() => setSavedMessage(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [savedMessage]);

  const selectedSummary =
    assetSummaries.find((summary) => summary.asset.id === selectedAssetId) ?? null;
  const selectedAssetSnapshots = useMemo(
    () => snapshots.filter((snapshot) => snapshot.asset_item_id === selectedAssetId),
    [selectedAssetId, snapshots]
  );
  const chartTargetOptions = useMemo<ChartTargetOption[]>(
    () => [
      {
        key: TOTAL_ASSET_CHART_TARGET_KEY,
        label: "総資産",
        shareLabel: "100%",
        currentValue: portfolioSummary.totalValue,
        change: portfolioSummary.change,
        lastUpdatedAt: portfolioSummary.lastUpdatedAt,
        lastRecordedOn: portfolioSummary.lastRecordedOn,
        description: "全資産項目の最新記録額を合算した推移を確認できます",
      },
      ...assetSummaries.map((summary) => ({
        key: buildAssetChartTargetKey(summary.asset.id),
        label: summary.asset.name,
        shareLabel: formatSharePercentage(
          calculateAssetShare(summary.currentValue, portfolioSummary.totalValue)
        ),
        currentValue: summary.currentValue,
        change: summary.change,
        lastUpdatedAt: summary.latestSnapshot?.updated_at ?? null,
        lastRecordedOn: summary.latestSnapshot?.recorded_on ?? null,
        description: summary.asset.description || "この資産項目の推移をチャートで確認できます",
      })),
    ],
    [assetSummaries, portfolioSummary]
  );
  const selectedTarget =
    chartTargetOptions.find((option) => option.key === selectedTargetKey) ?? chartTargetOptions[0];
  const chartPoints = useMemo(
    () =>
      selectedTargetKey === TOTAL_ASSET_CHART_TARGET_KEY
        ? buildTotalChartPoints(snapshots, selectedRange, assetNamesById)
        : buildAssetChartPoints(selectedAssetSnapshots, selectedRange, selectedSummary?.asset.name),
    [assetNamesById, selectedAssetSnapshots, selectedRange, selectedSummary?.asset.name, selectedTargetKey, snapshots]
  );
  const chartSubtitle =
    selectedTargetKey === TOTAL_ASSET_CHART_TARGET_KEY
      ? "各資産項目の最新記録額を合算した総資産推移です"
      : `${selectedTarget?.label ?? "選択中の資産"} の推移です`;
  const chartEmptyMessage =
    selectedTargetKey === TOTAL_ASSET_CHART_TARGET_KEY
      ? "資産記録が入ると総資産チャートが表示されます"
      : "選択した資産項目に記録がまだありません";
  const isCurrentViewSavedDefault =
    defaultPreferences.defaultTargetKey === selectedTargetKey &&
    defaultPreferences.defaultRange === selectedRange;

  const handleEditAsset = (asset: AssetItem) => {
    setEditingAsset(asset);
    setAssetModalOpen(true);
  };

  const handleDeleteAsset = (asset: AssetItem) => {
    if (!window.confirm(`「${asset.name}」を削除しますか？関連する記録履歴も削除されます。`)) return;
    deleteAssetMutation.mutate(asset.id);
  };

  const handleEditSnapshot = (snapshot: AssetSnapshot) => {
    setEditingSnapshot(snapshot);
    document.getElementById("snapshot-recorder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDeleteSnapshot = (snapshot: AssetSnapshot) => {
    const assetName = assetsById.get(snapshot.asset_item_id)?.name ?? "この資産";

    if (!window.confirm(`${assetName} の ${formatRecordedOn(snapshot.recorded_on)} の記録を削除しますか？`)) return;
    deleteSnapshotMutation.mutate(snapshot.id);
  };

  const handleSaveDefaultView = () => {
    const nextPreferences = {
      defaultTargetKey: selectedTargetKey,
      defaultRange: selectedRange,
    };

    saveMoneyChartPreferences(nextPreferences, validTargetKeys);
    setDefaultPreferences(nextPreferences);
    setSavedMessage("現在の表示を次回の初期表示として保存しました");
  };

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 sm:text-2xl">資産管理</h1>
            <p className="mt-1 text-sm text-slate-500">
              最新一覧で全体を把握し、統合チャートで総資産と各項目の推移を切り替えて確認できます
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAsset(null);
              setAssetModalOpen(true);
            }}
            className="btn-primary w-full justify-center sm:w-auto"
          >
            <Plus size={16} /> 資産項目を追加
          </button>
        </div>

        <PortfolioChart
          title="資産推移チャート"
          subtitle={chartSubtitle}
          tooltipTitle={selectedTarget?.label ?? "資産推移"}
          points={chartPoints}
          range={selectedRange}
          onRangeChange={setSelectedRange}
          color="#2563eb"
          emptyMessage={chartEmptyMessage}
          chartHeight={380}
          headerContent={
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <label className="text-xs font-medium text-slate-500">チャート対象</label>
                    <select
                      value={selectedTargetKey}
                      onChange={(event) => setSelectedTargetKey(event.target.value as AssetChartTargetKey)}
                      className="input mt-2 min-h-12 min-w-0 py-3 text-sm sm:max-w-md"
                    >
                      {chartTargetOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {`${option.label} (${option.shareLabel})`}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="mt-3 text-lg font-semibold text-slate-900">
                        {selectedTarget?.label ?? "総資産"}
                      </h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                        全体比 {selectedTarget?.shareLabel ?? "100%"}
                      </span>
                      {selectedTarget?.lastRecordedOn && (
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                          最終記録日 {formatRecordedOn(selectedTarget.lastRecordedOn)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedTarget?.description ?? "総資産と資産項目を同じチャートで確認できます"}
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={handleSaveDefaultView}
                      className="btn-ghost justify-center px-3 py-2 text-sm"
                    >
                      現在の表示を初期値に保存
                    </button>
                    <p className="text-xs text-slate-400">
                      {isCurrentViewSavedDefault
                        ? "この表示が初期表示に設定されています"
                        : "次回以降の初期表示を変更できます"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/80 bg-white px-4 py-3">
                    <p className="text-xs font-medium text-slate-400">現在値</p>
                    <p className="amount-text mt-1 text-base font-semibold text-slate-900 sm:text-lg">
                      {selectedTarget?.currentValue == null ? "未記録" : formatCurrency(selectedTarget.currentValue)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white px-4 py-3">
                    <p className="text-xs font-medium text-slate-400">前回記録比</p>
                    <p
                      className={`amount-text mt-1 text-base font-semibold sm:text-lg ${
                        selectedTarget?.change == null
                          ? "text-slate-900"
                          : selectedTarget.change >= 0
                            ? "text-emerald-600"
                            : "text-red-500"
                      }`}
                    >
                      {formatSignedCurrency(selectedTarget?.change ?? null)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white px-4 py-3">
                    <p className="text-xs font-medium text-slate-400">最終更新日時</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                      {selectedTarget?.lastUpdatedAt ? formatDateTime(selectedTarget.lastUpdatedAt) : "未記録"}
                    </p>
                  </div>
                </div>

                {savedMessage && <p className="mt-3 text-xs font-medium text-emerald-600">{savedMessage}</p>}
              </div>
            </div>
          }
        />

        <AssetCurrentList
          items={assetSummaries}
          selectedAssetId={selectedAssetId}
          onSelect={(assetId) => setSelectedTargetKey(buildAssetChartTargetKey(assetId))}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr,1.05fr]">
          <AssetSnapshotForm
            assets={assets}
            assetSummaries={assetSummaries}
            editingSnapshot={editingSnapshot}
            onEditingSnapshotChange={setEditingSnapshot}
          />

          <AssetSnapshotHistory
            snapshots={recentSnapshots}
            assetsById={assetsById}
            onEdit={handleEditSnapshot}
            onDelete={handleDeleteSnapshot}
          />
        </div>
      </div>

      <AssetItemModal
        open={assetModalOpen}
        asset={editingAsset}
        onClose={() => {
          setAssetModalOpen(false);
          setEditingAsset(null);
        }}
      />
    </>
  );
}
