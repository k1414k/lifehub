"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Pin, Trash2, Save, X } from "lucide-react";
import type { Memo, MemoType } from "@/types";
import { formatDeadlineDateTime, getDeadlineStatus } from "@/lib/memos";

interface Props {
  memo?: Memo;
  onSave: (data: Partial<Memo>) => Promise<void>;
  onDelete?: () => void;
  onClose?: () => void;
}

export default function MemoEditor({ memo, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(memo?.title ?? "");
  const [content, setContent] = useState(memo?.content ?? "");
  const [tags, setTags] = useState<string[]>(memo?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [pinned, setPinned] = useState(memo?.pinned ?? false);
  const [memoType, setMemoType] = useState<MemoType>(memo?.memo_type ?? "normal");
  const [deadlineDate, setDeadlineDate] = useState(
    memo?.deadline_at ? format(parseISO(memo.deadline_at), "yyyy-MM-dd") : ""
  );
  const [deadlineTime, setDeadlineTime] = useState(
    memo?.deadline_at ? format(parseISO(memo.deadline_at), "HH:mm") : ""
  );
  const [now, setNow] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const deadlineAt = memoType === "deadline" && deadlineDate && deadlineTime
    ? new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString()
    : null;
  const deadlineFieldsIncomplete = memoType === "deadline" && !deadlineAt;
  const deadlineStatus = deadlineAt ? getDeadlineStatus(deadlineAt, now) : null;

  useEffect(() => {
    setTitle(memo?.title ?? "");
    setContent(memo?.content ?? "");
    setTags(memo?.tags ?? []);
    setPinned(memo?.pinned ?? false);
    setMemoType(memo?.memo_type ?? "normal");
    setDeadlineDate(memo?.deadline_at ? format(parseISO(memo.deadline_at), "yyyy-MM-dd") : "");
    setDeadlineTime(memo?.deadline_at ? format(parseISO(memo.deadline_at), "HH:mm") : "");
  }, [memo?.id]);

  useEffect(() => {
    if (memoType !== "deadline") return;

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [memoType]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title,
      content,
      tags,
      pinned,
      memo_type: memoType,
      deadline_at: memoType === "deadline" ? deadlineAt : null,
    });
    setSaving(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  return (
    <div className="card flex h-full flex-col gap-4 lg:min-h-0">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            onClick={onClose}
            className="btn-ghost px-3 py-2"
            type="button"
          >
            <ArrowLeft size={14} />
            一覧へ
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deadlineFieldsIncomplete}
            className="btn-primary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
          >
            <Save size={14} />
            {saving ? "保存中..." : "保存"}
          </button>
        </div>

        {deadlineStatus && (
          <div className={`rounded-2xl border px-4 py-3 ${deadlineStatus.expired ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
            <p className={`text-sm font-semibold ${deadlineStatus.expired ? "text-rose-600" : "text-amber-700"}`}>
              {deadlineStatus.label}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              締切: {formatDeadlineDateTime(deadlineAt!)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <input
            className="flex-1 bg-transparent text-xl font-display font-bold text-slate-900 outline-none placeholder:text-slate-300"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setPinned((p) => !p)}
              className={`rounded-xl p-2 transition-colors ${pinned ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:bg-slate-100"}`}
              title="ピン留め"
              type="button"
            >
              <Pin size={16} />
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || deadlineFieldsIncomplete}
              className="btn-primary hidden py-1.5 disabled:cursor-not-allowed disabled:opacity-60 lg:inline-flex"
              type="button"
            >
              <Save size={14} />
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,220px)_1fr]">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">メモ種別</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "normal", label: "通常メモ" },
              { value: "deadline", label: "deadlineメモ" },
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setMemoType(option.value);
                  if (option.value === "normal") {
                    setDeadlineDate("");
                    setDeadlineTime("");
                  }
                }}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${
                  memoType === option.value
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {memoType === "deadline" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">締切日</span>
              <input
                type="date"
                className="input text-sm"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">締切時刻</span>
              <input
                type="time"
                className="input text-sm"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
              />
            </label>
          </div>
        )}
      </div>

      {deadlineFieldsIncomplete && (
        <p className="text-sm text-rose-500">deadlineメモでは締切日と締切時刻の入力が必要です。</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[140px] flex-1 rounded-full border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 sm:flex-none"
          placeholder="タグを追加..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          onBlur={addTag}
        />
      </div>

      <textarea
        className="min-h-[280px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-300 lg:min-h-0"
        placeholder="ここにメモを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
