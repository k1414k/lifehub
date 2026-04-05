"use client";

import { type ReactNode, useId } from "react";
import type { CSSProperties } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_RANGE_OPTIONS,
  type AssetChartPoint,
  type AssetChartRange,
  formatChartDate,
  formatChartTooltipDate,
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/assets";

interface Props {
  title: string;
  subtitle?: string;
  points: AssetChartPoint[];
  range: AssetChartRange;
  onRangeChange: (range: AssetChartRange) => void;
  color?: string;
  emptyMessage: string;
  controls?: ReactNode;
}

interface TooltipProps {
  active?: boolean;
  label?: number | string;
  payload?: Array<{
    value?: number | string | null;
    payload?: AssetChartPoint;
  }>;
}

function ChartTooltip({ active, label, payload, title }: TooltipProps & { title: string }) {
  const point = payload?.[0]?.payload;

  if (!active || !point) return null;

  const rawValue = payload?.[0]?.value ?? point.value;
  const numericValue = rawValue == null ? NaN : Number(rawValue);
  const events = point.events ?? [];

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur"
      style={
        {
          width: "min(20rem, calc(100vw - 2rem))",
          maxHeight: "18rem",
          overflowY: "auto",
        } satisfies CSSProperties
      }
    >
      <p className="font-medium text-slate-500">
        {formatChartTooltipDate(Number(label ?? point.timestamp))}
      </p>
      <div className="mt-2">
        <p className="text-[11px] text-slate-500">{title}</p>
        <p className="amount-text mt-1 text-sm font-semibold text-slate-900">
          {Number.isNaN(numericValue) ? "未記録" : formatCurrency(numericValue)}
        </p>
      </div>

      {events.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {events.map((event) => (
            <div key={event.snapshotId} className="space-y-1">
              {event.assetName && (
                <p className="text-[11px] font-semibold text-slate-600">{event.assetName}</p>
              )}
              <p className="whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-600">
                {event.note ?? "メモなし"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioChart({
  title,
  subtitle,
  points,
  range,
  onRangeChange,
  color = "#2563eb",
  emptyMessage,
  controls,
}: Props) {
  const hasValues = points.some((point) => point.value != null);
  const gradientId = useId().replace(/:/g, "");
  const showDots = points.filter((point) => point.value != null).length <= 12;

  return (
    <div className="card">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-800">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <div className="flex flex-col gap-3 xl:items-end">
            {controls}
            <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {CHART_RANGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onRangeChange(option)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    option === range
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!hasValues ? (
          <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-sm text-slate-400">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={points} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatChartDate(value)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={96}
                tickFormatter={(value: number) => formatCompactCurrency(value)}
              />
              <Tooltip
                content={<ChartTooltip title={title} />}
                cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
              />
              <Area
                type="linear"
                dataKey="value"
                stroke="none"
                fill={`url(#${gradientId})`}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={
                  showDots
                    ? { r: 2.5, fill: color, stroke: "#fff", strokeWidth: 1.5 }
                    : false
                }
                connectNulls={false}
                activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
