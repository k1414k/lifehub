"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Boxes, Clock3, Plus, Wallet } from "lucide-react";
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
  buildAssetChartPoints,
  buildAssetItemSummaries,
  buildPortfolioSummary,
  buildTotalChartPoints,
  formatCurrency,
  formatDateTime,
  formatRecordedOn,
  formatSignedCurrency,
  sortSnapshotsRecentFirst,
  type AssetChartRange,
} from "@/lib/assets";
import type { AssetItem, AssetSnapshot } from "@/types";

export default function MoneyPage() {
  const { data: assets = [] } = useAssets();
  const { data: snapshots = [] } = useAssetSnapshots();
  const deleteAssetMutation = useDeleteAsset();
  const deleteSnapshotMutation = useDeleteAssetSnapshot();
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [editingSnapshot, setEditingSnapshot] = useState<AssetSnapshot | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [totalRange, setTotalRange] = useState<AssetChartRange>("3M");
  const [assetRange, setAssetRange] = useState<AssetChartRange>("3M");

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

  useEffect(() => {
    if (assets.length === 0) {
      setSelectedAssetId(null);
      return;
    }

    if (selectedAssetId && assets.some((asset) => asset.id === selectedAssetId)) return;
    setSelectedAssetId(assets[0].id);
  }, [assets, selectedAssetId]);

  const selectedSummary =
    assetSummaries.find((summary) => summary.asset.id === selectedAssetId) ?? null;
  const selectedAssetSnapshots = useMemo(
    () => snapshots.filter((snapshot) => snapshot.asset_item_id === selectedAssetId),
    [selectedAssetId, snapshots]
  );
  const totalChartPoints = useMemo(
    () => buildTotalChartPoints(snapshots, totalRange, assetNamesById),
    [assetNamesById, snapshots, totalRange]
  );
  const assetChartPoints = useMemo(
    () => buildAssetChartPoints(selectedAssetSnapshots, assetRange, selectedSummary?.asset.name),
    [assetRange, selectedAssetSnapshots, selectedSummary?.asset.name]
  );

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

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 sm:text-2xl">資産管理</h1>
            <p className="mt-1 text-sm text-slate-500">総資産と項目別推移を、記録イベントベースで管理します</p>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card flex items-start gap-3 sm:gap-4">
            <div className="rounded-xl bg-emerald-50 p-2">
              <Wallet size={20} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">総資産</p>
              <p className="amount-text mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                {portfolioSummary.totalValue == null ? "未記録" : formatCurrency(portfolioSummary.totalValue)}
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-3 sm:gap-4">
            <div className="rounded-xl bg-brand-50 p-2">
              <ArrowUpRight size={20} className="text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">前回記録比</p>
              <p
                className={`amount-text mt-1 text-xl font-bold sm:text-2xl ${
                  portfolioSummary.change == null
                    ? "text-slate-900"
                    : portfolioSummary.change >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                }`}
              >
                {formatSignedCurrency(portfolioSummary.change)}
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-3 sm:gap-4">
            <div className="rounded-xl bg-amber-50 p-2">
              <Clock3 size={20} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">最終更新日時</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 sm:text-base">
                {portfolioSummary.lastUpdatedAt ? formatDateTime(portfolioSummary.lastUpdatedAt) : "未記録"}
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-3 sm:gap-4">
            <div className="rounded-xl bg-violet-50 p-2">
              <Boxes size={20} className="text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">登録中の資産項目数</p>
              <p className="amount-text mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                {portfolioSummary.assetCount}
              </p>
            </div>
          </div>
        </div>

        <PortfolioChart
          title="総資産チャート"
          subtitle="各資産項目の最新記録額を合計した、総資産の推移です"
          points={totalChartPoints}
          range={totalRange}
          onRangeChange={setTotalRange}
          color="#2563eb"
          emptyMessage="資産記録が入ると総資産チャートが表示されます"
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr,1fr]">
          <PortfolioChart
            title="資産項目別チャート"
            subtitle={
              selectedSummary
                ? `${selectedSummary.asset.name} の推移を折れ線チャートで表示しています`
                : "表示する資産項目を選択してください"
            }
            points={assetChartPoints}
            range={assetRange}
            onRangeChange={setAssetRange}
            color="#2563eb"
            emptyMessage="選択した資産項目に記録がまだありません"
            controls={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedAssetId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedAssetId(value ? Number(value) : null);
                  }}
                  className="input min-w-52 py-2.5"
                  disabled={assets.length === 0}
                >
                  <option value="">資産項目を選択してください</option>
                  {assetSummaries.map((summary) => (
                    <option key={summary.asset.id} value={summary.asset.id}>
                      {summary.asset.name}
                    </option>
                  ))}
                </select>
                {selectedSummary && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-500">
                    現在値{" "}
                    <span className="amount-text inline-block">
                      {selectedSummary.currentValue == null ? "未記録" : formatCurrency(selectedSummary.currentValue)}
                    </span>
                  </div>
                )}
              </div>
            }
          />

          <AssetSnapshotForm
            assets={assets}
            assetSummaries={assetSummaries}
            editingSnapshot={editingSnapshot}
            onEditingSnapshotChange={setEditingSnapshot}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <AssetCurrentList
            items={assetSummaries}
            selectedAssetId={selectedAssetId}
            onSelect={setSelectedAssetId}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />

          <div className="card">
            <h2 className="font-semibold text-slate-800">現在の把握ポイント</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium text-slate-400">選択中の資産</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {selectedSummary?.asset.name ?? "未選択"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedSummary?.asset.description || "資産項目を選ぶと、ここに説明を表示します"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium text-slate-400">最終記録日</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {selectedSummary?.latestSnapshot
                    ? formatRecordedOn(selectedSummary.latestSnapshot.recorded_on)
                    : "未記録"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium text-slate-400">前回との差分</p>
                <p
                  className={`amount-text mt-1 text-base font-semibold ${
                    selectedSummary?.change == null
                      ? "text-slate-900"
                      : selectedSummary.change >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                  }`}
                >
                  {formatSignedCurrency(selectedSummary?.change ?? null)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <AssetSnapshotHistory
          snapshots={recentSnapshots}
          assetsById={assetsById}
          onEdit={handleEditSnapshot}
          onDelete={handleDeleteSnapshot}
        />
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
