import {
  endOfDay,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { ja } from "date-fns/locale";
import type { AssetItem, AssetSnapshot } from "@/types";

export type AssetChartRange = "1D" | "7D" | "1M" | "3M" | "1Y" | "ALL";

export const CHART_RANGE_OPTIONS: AssetChartRange[] = ["1D", "7D", "1M", "3M", "1Y", "ALL"];

export interface AssetChartPoint {
  timestamp: number;
  value: number | null;
  label: string;
  events?: AssetChartEvent[];
}

export interface AssetChartEvent {
  snapshotId: number;
  assetItemId: number;
  assetName?: string;
  amount: number;
  note: string | null;
  recordedOn: string;
}

export interface AssetItemSummary {
  asset: AssetItem;
  latestSnapshot: AssetSnapshot | null;
  previousSnapshot: AssetSnapshot | null;
  currentValue: number | null;
  previousValue: number | null;
  change: number | null;
}

export interface PortfolioSummary {
  totalValue: number | null;
  previousTotalValue: number | null;
  change: number | null;
  lastUpdatedAt: string | null;
  lastRecordedOn: string | null;
  assetCount: number;
}

export function amountToNumber(value: number | string | null | undefined) {
  if (value == null) return 0;
  return Number(value);
}

export function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

export function formatSignedCurrency(value: number | null) {
  if (value == null) return "初回記録";
  if (value === 0) return "±0円";

  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}

export function formatCompactCurrency(value: number) {
  const abs = Math.abs(value);

  if (abs >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(abs >= 1_000_000_000 ? 0 : 1)}億円`;
  }

  if (abs >= 10_000) {
    return `${(value / 10_000).toFixed(abs >= 1_000_000 ? 0 : 1)}万円`;
  }

  return formatCurrency(value);
}

export function formatRecordedOn(dateString: string) {
  return format(parseISO(dateString), "yyyy/MM/dd", { locale: ja });
}

export function formatDateTime(dateString: string) {
  return format(new Date(dateString), "yyyy/MM/dd HH:mm", { locale: ja });
}

export function formatChartDate(timestamp: number) {
  return format(new Date(timestamp), "M/d", { locale: ja });
}

export function formatChartTooltipDate(timestamp: number) {
  return format(new Date(timestamp), "yyyy/MM/dd", { locale: ja });
}

function snapshotTimestamp(snapshot: AssetSnapshot) {
  return startOfDay(parseISO(snapshot.recorded_on)).getTime();
}

function snapshotSortAsc(a: AssetSnapshot, b: AssetSnapshot) {
  return (
    snapshotTimestamp(a) - snapshotTimestamp(b) ||
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
    a.id - b.id
  );
}

export function sortSnapshotsChronologically(snapshots: AssetSnapshot[]) {
  return [...snapshots].sort(snapshotSortAsc);
}

export function sortSnapshotsRecentFirst(snapshots: AssetSnapshot[]) {
  return [...sortSnapshotsChronologically(snapshots)].reverse();
}

export function groupSnapshotsByAsset(snapshots: AssetSnapshot[]) {
  const grouped = new Map<number, AssetSnapshot[]>();

  for (const snapshot of sortSnapshotsChronologically(snapshots)) {
    const current = grouped.get(snapshot.asset_item_id) ?? [];
    current.push(snapshot);
    grouped.set(snapshot.asset_item_id, current);
  }

  return grouped;
}

export function calculateSnapshotChange(
  currentAmount: number | string | null | undefined,
  previousAmount: number | string | null | undefined
) {
  if (currentAmount == null || previousAmount == null) return null;

  return amountToNumber(currentAmount) - amountToNumber(previousAmount);
}

export function buildSnapshotChangeMap(snapshots: AssetSnapshot[]) {
  const changeMap = new Map<number, number | null>();

  for (const itemSnapshots of groupSnapshotsByAsset(snapshots).values()) {
    itemSnapshots.forEach((snapshot, index) => {
      const previousSnapshot = itemSnapshots[index - 1] ?? null;

      changeMap.set(
        snapshot.id,
        calculateSnapshotChange(snapshot.amount, previousSnapshot?.amount)
      );
    });
  }

  return changeMap;
}

function getRangeStart(range: AssetChartRange, end: Date, earliest: AssetSnapshot | null) {
  if (range === "ALL") {
    return earliest ? startOfDay(parseISO(earliest.recorded_on)) : startOfDay(end);
  }

  if (range === "1D") return startOfDay(subDays(end, 1));
  if (range === "7D") return startOfDay(subDays(end, 7));
  if (range === "1M") return startOfDay(subMonths(end, 1));
  if (range === "3M") return startOfDay(subMonths(end, 3));

  return startOfDay(subYears(end, 1));
}

function getRangeBounds(range: AssetChartRange, snapshots: AssetSnapshot[]) {
  const sorted = sortSnapshotsChronologically(snapshots);
  const earliest = sorted[0] ?? null;
  const latest = sorted.at(-1) ?? null;
  const end = latest ? endOfDay(parseISO(latest.recorded_on)) : endOfDay(new Date());
  const start = getRangeStart(range, end, earliest);

  return { start, end };
}

function pushPoint(
  points: AssetChartPoint[],
  timestamp: number,
  value: number | null,
  events?: AssetChartEvent[]
) {
  const point = { timestamp, value, label: formatChartDate(timestamp), events };
  const lastPoint = points.at(-1);

  if (lastPoint && lastPoint.timestamp === timestamp) {
    points[points.length - 1] = point;
    return;
  }

  points.push(point);
}

function findLatestSnapshotAtOrBefore(snapshots: AssetSnapshot[], targetTimestamp: number) {
  let latestSnapshot: AssetSnapshot | null = null;

  for (const snapshot of snapshots) {
    if (snapshotTimestamp(snapshot) <= targetTimestamp) {
      latestSnapshot = snapshot;
      continue;
    }

    break;
  }

  return latestSnapshot;
}

function normalizeSnapshotNote(note?: string | null) {
  const trimmed = note?.trim();
  return trimmed ? trimmed : null;
}

function buildChartEventsByTimestamp(
  snapshots: AssetSnapshot[],
  getAssetName?: (snapshot: AssetSnapshot) => string | undefined
) {
  const eventMap = new Map<number, AssetChartEvent[]>();

  for (const snapshot of snapshots) {
    const timestamp = snapshotTimestamp(snapshot);
    const events = eventMap.get(timestamp) ?? [];

    events.push({
      snapshotId: snapshot.id,
      assetItemId: snapshot.asset_item_id,
      assetName: getAssetName?.(snapshot),
      amount: amountToNumber(snapshot.amount),
      note: normalizeSnapshotNote(snapshot.note),
      recordedOn: snapshot.recorded_on,
    });

    eventMap.set(timestamp, events);
  }

  return eventMap;
}

function getBoundaryEvents(
  eventMap: Map<number, AssetChartEvent[]>,
  snapshot: AssetSnapshot | null,
  boundaryDate: Date
) {
  if (!snapshot) return undefined;
  if (!isSameDay(parseISO(snapshot.recorded_on), boundaryDate)) return undefined;

  return eventMap.get(snapshotTimestamp(snapshot));
}

function calculateTotalValueAt(groupedSnapshots: Map<number, AssetSnapshot[]>, targetTimestamp: number) {
  let knownAssetCount = 0;
  let total = 0;

  for (const snapshots of groupedSnapshots.values()) {
    const latestSnapshot = findLatestSnapshotAtOrBefore(snapshots, targetTimestamp);

    if (!latestSnapshot) continue;

    knownAssetCount += 1;
    total += amountToNumber(latestSnapshot.amount);
  }

  return knownAssetCount > 0 ? total : null;
}

export function buildAssetItemSummaries(assets: AssetItem[], snapshots: AssetSnapshot[]) {
  const groupedSnapshots = groupSnapshotsByAsset(snapshots);

  return [...assets]
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
    .map<AssetItemSummary>((asset) => {
      const itemSnapshots = groupedSnapshots.get(asset.id) ?? [];
      const latestSnapshot = itemSnapshots.at(-1) ?? null;
      const previousSnapshot = itemSnapshots.at(-2) ?? null;
      const currentValue = latestSnapshot ? amountToNumber(latestSnapshot.amount) : null;
      const previousValue = previousSnapshot ? amountToNumber(previousSnapshot.amount) : null;

      return {
        asset,
        latestSnapshot,
        previousSnapshot,
        currentValue,
        previousValue,
        change: calculateSnapshotChange(currentValue, previousValue),
      };
    });
}

function buildTotalEventSeries(snapshots: AssetSnapshot[]) {
  const sorted = sortSnapshotsChronologically(snapshots);
  const groupedSnapshots = groupSnapshotsByAsset(sorted);
  const timestamps = [...new Set(sorted.map(snapshotTimestamp))];

  return timestamps
    .map((timestamp) => ({
      timestamp,
      value: calculateTotalValueAt(groupedSnapshots, timestamp),
      label: formatChartDate(timestamp),
    }))
    .filter((point): point is AssetChartPoint & { value: number } => point.value != null);
}

export function buildPortfolioSummary(assets: AssetItem[], snapshots: AssetSnapshot[]): PortfolioSummary {
  const eventSeries = buildTotalEventSeries(snapshots);
  const latestPoint = eventSeries.at(-1) ?? null;
  const previousPoint = eventSeries.at(-2) ?? null;
  const latestUpdatedSnapshot =
    [...snapshots].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0] ?? null;

  return {
    totalValue: latestPoint?.value ?? null,
    previousTotalValue: previousPoint?.value ?? null,
    change: calculateSnapshotChange(latestPoint?.value, previousPoint?.value),
    lastUpdatedAt: latestUpdatedSnapshot?.updated_at ?? null,
    lastRecordedOn: latestUpdatedSnapshot?.recorded_on ?? null,
    assetCount: assets.length,
  };
}

export function buildAssetChartPoints(
  snapshots: AssetSnapshot[],
  range: AssetChartRange,
  assetName?: string
) {
  const sorted = sortSnapshotsChronologically(snapshots);

  if (sorted.length === 0) return [];

  const { start, end } = getRangeBounds(range, sorted);
  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime();
  const eventMap = buildChartEventsByTimestamp(
    sorted,
    assetName ? () => assetName : undefined
  );
  const beforeStart = findLatestSnapshotAtOrBefore(sorted, startTimestamp);
  const inRange = sorted.filter((snapshot) => {
    const timestamp = snapshotTimestamp(snapshot);
    return timestamp >= startTimestamp && timestamp <= endTimestamp;
  });
  const points: AssetChartPoint[] = [];

  if (beforeStart) {
    pushPoint(points, startTimestamp, amountToNumber(beforeStart.amount));
  } else if (inRange.length > 0 && snapshotTimestamp(inRange[0]) > startTimestamp) {
    pushPoint(points, startTimestamp, null);
  }

  for (const snapshot of inRange) {
    pushPoint(
      points,
      snapshotTimestamp(snapshot),
      amountToNumber(snapshot.amount),
      eventMap.get(snapshotTimestamp(snapshot))
    );
  }

  const lastKnownSnapshot = inRange.at(-1) ?? beforeStart;

  if (lastKnownSnapshot && snapshotTimestamp(lastKnownSnapshot) < endTimestamp) {
    pushPoint(
      points,
      endTimestamp,
      amountToNumber(lastKnownSnapshot.amount),
      getBoundaryEvents(eventMap, lastKnownSnapshot, end)
    );
  }

  return points;
}

export function buildTotalChartPoints(
  snapshots: AssetSnapshot[],
  range: AssetChartRange,
  assetNamesById?: Map<number, string>
) {
  const sorted = sortSnapshotsChronologically(snapshots);

  if (sorted.length === 0) return [];

  const { start, end } = getRangeBounds(range, sorted);
  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime();
  const groupedSnapshots = groupSnapshotsByAsset(sorted);
  const eventMap = buildChartEventsByTimestamp(
    sorted,
    assetNamesById ? (snapshot) => assetNamesById.get(snapshot.asset_item_id) : undefined
  );
  const timestampsInRange = [
    ...new Set(
      sorted
        .map(snapshotTimestamp)
        .filter((timestamp) => timestamp >= startTimestamp && timestamp <= endTimestamp)
    ),
  ];
  const points: AssetChartPoint[] = [];
  const startValue = calculateTotalValueAt(groupedSnapshots, startTimestamp);

  if (startValue != null) {
    pushPoint(points, startTimestamp, startValue);
  } else if (timestampsInRange.length > 0 && timestampsInRange[0] > startTimestamp) {
    pushPoint(points, startTimestamp, null);
  }

  for (const timestamp of timestampsInRange) {
    pushPoint(
      points,
      timestamp,
      calculateTotalValueAt(groupedSnapshots, timestamp),
      eventMap.get(timestamp)
    );
  }

  const endValue = calculateTotalValueAt(groupedSnapshots, endTimestamp);

  if (endValue != null) {
    pushPoint(
      points,
      endTimestamp,
      endValue,
      getBoundaryEvents(eventMap, sorted.at(-1) ?? null, end)
    );
  }

  return points;
}
