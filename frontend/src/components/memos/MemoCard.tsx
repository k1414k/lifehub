"use client";

import { useEffect, useState } from "react";
import { Pin, Trash2 } from "lucide-react";
import type { Memo } from "@/types";
import { formatDeadlineDateTime, getDeadlineStatus, isDeadlineMemo } from "@/lib/memos";

interface Props {
  memo: Memo;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function MemoCard({ memo, active, onClick, onDelete }: Props) {
  const [now, setNow] = useState(() => new Date());
  const deadlineStatus = isDeadlineMemo(memo) ? getDeadlineStatus(memo.deadline_at!, now) : null;

  useEffect(() => {
    if (!isDeadlineMemo(memo)) return;

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [memo.id, memo.memo_type, memo.deadline_at]);

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer p-3 group transition-all duration-150
        ${active ? "ring-2 ring-brand-400 shadow-card-hover dark:ring-brand-300" : "hover:shadow-card-hover"}`}
    >
      {deadlineStatus && (
        <p className={`mb-2 text-[11px] font-medium ${deadlineStatus.expired ? "text-rose-500 dark:text-rose-300" : "text-red-600 dark:text-red-300"}`}>
          {deadlineStatus.label}
        </p>
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800 truncate dark:text-slate-100 flex-1">
          {memo.title || "無題"}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {memo.pinned && <Pin size={12} className="text-brand-400 dark:text-brand-300" />}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded p-0.5 text-slate-400 transition-all hover:text-red-500 dark:text-slate-500 dark:hover:text-red-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`${memo.title || "メモ"} を削除`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {isDeadlineMemo(memo) && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          締切: {formatDeadlineDateTime(memo.deadline_at!)}
        </p>
      )}
      <p className="mt-1 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">{memo.content || "内容なし"}</p>
      {memo.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {memo.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-brand-500/10 dark:text-brand-200">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
