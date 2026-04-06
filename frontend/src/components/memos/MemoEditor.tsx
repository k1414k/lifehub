"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Pin, Trash2, Save, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { formatDeadlineDateTime, getDeadlineStatus } from "@/lib/memos";
import { usePreferencesStore } from "@/stores/preferencesStore";
import type { Memo, MemoForm, MemoType } from "@/types";

interface Props {
  memo?: Memo;
  onSave: (data: Partial<MemoForm>) => Promise<Memo | void>;
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    memo?.updated_at ? new Date(memo.updated_at) : null
  );
  const [isDesktop, setIsDesktop] = useState(false);
  const memoFontSize = usePreferencesStore((state) => state.memoFontSize);
  const deadlineAt = memoType === "deadline" && deadlineDate && deadlineTime
    ? new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString()
    : null;
  const deadlineFieldsIncomplete = memoType === "deadline" && !deadlineAt;
  const deadlineStatus = deadlineAt ? getDeadlineStatus(deadlineAt, now) : null;
  const payload = useMemo<Partial<MemoForm>>(
    () => ({
      title,
      content,
      tags,
      pinned,
      memo_type: memoType,
      deadline_at: memoType === "deadline" ? deadlineAt : null,
    }),
    [content, deadlineAt, memoType, pinned, tags, title]
  );
  const serializedPayload = useMemo(() => JSON.stringify(payload), [payload]);
  const lastSavedPayloadRef = useRef(serializedPayload);
  const latestPayloadRef = useRef(payload);
  const latestSerializedPayloadRef = useRef(serializedPayload);
  const isSavingRef = useRef(false);
  const shouldSaveAgainRef = useRef(false);

  useEffect(() => {
    setTitle(memo?.title ?? "");
    setContent(memo?.content ?? "");
    setTags(memo?.tags ?? []);
    setPinned(memo?.pinned ?? false);
    setMemoType(memo?.memo_type ?? "normal");
    setDeadlineDate(memo?.deadline_at ? format(parseISO(memo.deadline_at), "yyyy-MM-dd") : "");
    setDeadlineTime(memo?.deadline_at ? format(parseISO(memo.deadline_at), "HH:mm") : "");
    const nextSavedPayload = JSON.stringify({
      title: memo?.title ?? "",
      content: memo?.content ?? "",
      tags: memo?.tags ?? [],
      pinned: memo?.pinned ?? false,
      memo_type: memo?.memo_type ?? "normal",
      deadline_at: memo?.memo_type === "deadline" ? memo?.deadline_at ?? null : null,
    });
    lastSavedPayloadRef.current = nextSavedPayload;
    latestSerializedPayloadRef.current = nextSavedPayload;
    setSaveError(null);
    setLastSavedAt(memo?.updated_at ? new Date(memo.updated_at) : null);
  }, [memo?.id]);

  useEffect(() => {
    if (memoType !== "deadline") return;

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [memoType]);

  useEffect(() => {
    latestPayloadRef.current = payload;
    latestSerializedPayloadRef.current = serializedPayload;
  }, [payload, serializedPayload]);

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 640);

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const performSave = useCallback(async () => {
    if (deadlineFieldsIncomplete) return;

    const currentSerializedPayload = latestSerializedPayloadRef.current;

    if (currentSerializedPayload === lastSavedPayloadRef.current) return;

    if (isSavingRef.current) {
      shouldSaveAgainRef.current = true;
      return;
    }

    isSavingRef.current = true;
    shouldSaveAgainRef.current = false;
    setSaving(true);
    setSaveError(null);

    try {
      await onSave(latestPayloadRef.current);
      lastSavedPayloadRef.current = currentSerializedPayload;
      setLastSavedAt(new Date());
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "自動保存に失敗しました"));
    } finally {
      isSavingRef.current = false;
      setSaving(false);

      if (
        shouldSaveAgainRef.current &&
        latestSerializedPayloadRef.current !== lastSavedPayloadRef.current
      ) {
        shouldSaveAgainRef.current = false;
        void performSave();
      }
    }
  }, [deadlineFieldsIncomplete, onSave]);

  useEffect(() => {
    if (deadlineFieldsIncomplete) return;
    if (serializedPayload === lastSavedPayloadRef.current) return;

    const timeoutId = window.setTimeout(() => {
      void performSave();
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [deadlineFieldsIncomplete, performSave, serializedPayload]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  return (
    <div className="card flex h-full flex-col gap-4 lg:min-h-0">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
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
            onClick={() => void performSave()}
            disabled={saving || deadlineFieldsIncomplete}
            className="btn-primary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
          >
            <Save size={14} />
            {saving ? "保存中..." : "今すぐ保存"}
          </button>
        </div>

        {deadlineStatus && (
          <div className={`rounded-2xl border px-4 py-3 ${deadlineStatus.expired ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"}`}>
            <p className={`text-sm font-semibold ${deadlineStatus.expired ? "text-rose-600 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"}`}>
              {deadlineStatus.label}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              締切: {formatDeadlineDateTime(deadlineAt!)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <input
            className="flex-1 bg-transparent text-xl font-display font-bold text-slate-900 outline-none placeholder:text-slate-300 dark:text-slate-50 dark:placeholder:text-slate-600"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setPinned((p) => !p)}
              className={`rounded-xl p-2 transition-colors ${pinned ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300" : "text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"}`}
              title="ピン留め"
              type="button"
            >
              <Pin size={16} />
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => void performSave()}
              disabled={saving || deadlineFieldsIncomplete}
              className="btn-primary hidden py-1.5 disabled:cursor-not-allowed disabled:opacity-60 lg:inline-flex"
              type="button"
            >
              <Save size={14} />
              {saving ? "保存中..." : "今すぐ保存"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {saving ? "自動保存中..." : "変更は自動で保存されます"}
          </span>
          {lastSavedAt && !saving && (
            <span className="text-slate-400 dark:text-slate-500">
              最終保存: {lastSavedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,220px)_1fr]">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">メモ種別</p>
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
                    ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
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
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">締切日</span>
              <input
                type="date"
                className="input text-sm"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">締切時刻</span>
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

      {saveError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {saveError}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-xs text-brand-600 dark:bg-brand-500/10 dark:text-brand-200">
            {tag}
            <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[140px] flex-1 rounded-full border border-slate-200 px-3 py-2 text-xs outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 sm:flex-none"
          placeholder="タグを追加..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          onBlur={addTag}
        />
      </div>

      <textarea
        className="min-h-[280px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-300 dark:text-slate-200 dark:placeholder:text-slate-600 lg:min-h-0"
        placeholder="ここにメモを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={isDesktop ? { fontSize: `${memoFontSize}px`, lineHeight: 1.7 } : undefined}
      />
    </div>
  );
}
