"use client";

import { useMemo, useState } from "react";
import { Boxes, FolderOpen, StickyNote, Wallet, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import PortfolioChart from "@/components/money/PortfolioChart";
import { useAssets, useAssetSnapshots, useMemos, useFiles } from "@/hooks/useApi";
import {
  buildPortfolioSummary,
  buildTotalChartPoints,
  formatCurrency,
  formatRecordedOn,
  formatSignedCurrency,
  sortSnapshotsRecentFirst,
  type AssetChartRange,
} from "@/lib/assets";

export default function DashboardPage() {
  const { data: assets = [] } = useAssets();
  const { data: snapshots = [] } = useAssetSnapshots();
  const { data: memos = [] } = useMemos();
  const { data: files = [] } = useFiles();
  const [chartRange, setChartRange] = useState<AssetChartRange>("3M");
  const now = new Date();
  const portfolioSummary = useMemo(
    () => buildPortfolioSummary(assets, snapshots),
    [assets, snapshots]
  );
  const chartPoints = useMemo(
    () => buildTotalChartPoints(snapshots, chartRange),
    [chartRange, snapshots]
  );
  const recentSnapshots = useMemo(
    () => sortSnapshotsRecentFirst(snapshots).slice(0, 5),
    [snapshots]
  );
  const assetNames = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset.name])),
    [assets]
  );
  const pinnedMemos = memos.filter((m) => m.pinned).slice(0, 3);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-900 sm:text-2xl">ダッシュボード</h1>
        <p className="text-sm text-slate-500 mt-1">{format(now, "yyyy年M月d日（E）", { locale: ja })}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "総資産",
            value: portfolioSummary.totalValue == null ? "未記録" : formatCurrency(portfolioSummary.totalValue),
            icon: <Wallet size={18} />,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "前回記録比",
            value: formatSignedCurrency(portfolioSummary.change),
            icon: <ArrowRight size={18} />,
            color: "bg-brand-50 text-brand-600",
          },
          {
            label: "資産項目数",
            value: `${portfolioSummary.assetCount}`,
            icon: <Boxes size={18} />,
            color: "bg-amber-50 text-amber-600",
          },
          { label: "メモ / ファイル", value: `${memos.length} / ${files.length}`, icon: <StickyNote size={18} />,  color: "bg-violet-50 text-violet-600" },
        ].map((c) => (
          <div key={c.label} className="card flex items-center gap-3 sm:gap-4">
            <div className={`p-2.5 rounded-xl shrink-0 ${c.color}`}>{c.icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">{c.label}</p>
              <p className="amount-text mt-1 text-lg font-bold text-slate-900 sm:text-xl">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <PortfolioChart
            title="総資産推移"
            subtitle="表示期間内の総資産推移を折れ線チャートで表示します"
            points={chartPoints}
            range={chartRange}
            onRangeChange={setChartRange}
            color="#2563eb"
            emptyMessage="資産記録が入るとここに総資産チャートが表示されます"
          />
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">最近の資産記録</h2>
            <Link href="/money" className="text-xs text-brand-600 hover:underline flex items-center gap-1">すべて <ArrowRight size={12} /></Link>
          </div>
          {recentSnapshots.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">資産記録がありません</p>
          ) : (
            <ul className="space-y-2">
              {recentSnapshots.map((snapshot) => (
                <li key={snapshot.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {assetNames.get(snapshot.asset_item_id) ?? "削除済みの資産"}
                    </p>
                    <p className="text-xs text-slate-400">{formatRecordedOn(snapshot.recorded_on)}</p>
                  </div>
                  <span className="amount-text shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(Number(snapshot.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {pinnedMemos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">ピン留めメモ</h2>
            <Link href="/memos" className="text-xs text-brand-600 hover:underline flex items-center gap-1">すべて <ArrowRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pinnedMemos.map((m) => (
              <Link key={m.id} href="/memos" className="card hover:shadow-card-hover transition-shadow block">
                <p className="text-sm font-semibold text-slate-800 truncate">{m.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.content || "内容なし"}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { href: "/money", label: "資産を記録する", icon: <Wallet size={20} />,    color: "bg-emerald-50 text-emerald-600" },
          { href: "/memos", label: "メモを書く",     icon: <StickyNote size={20} />, color: "bg-violet-50 text-violet-600" },
          { href: "/files", label: "ファイルを管理", icon: <FolderOpen size={20} />, color: "bg-brand-50 text-brand-600" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="card group flex items-center gap-4 hover:shadow-card-hover transition-shadow">
            <div className={`p-2.5 rounded-xl ${item.color}`}>{item.icon}</div>
            <span className="min-w-0 flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
            <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
