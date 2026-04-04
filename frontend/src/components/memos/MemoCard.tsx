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
        ${active ? "ring-2 ring-brand-400 shadow-card-hover" : "hover:shadow-card-hover"}`}
    >
      {deadlineStatus && (
        <p className={`mb-2 text-[11px] font-medium ${deadlineStatus.expired ? "text-rose-500" : "text-red-600"}`}>
          {deadlineStatus.label}
        </p>
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800 truncate flex-1">
          {memo.title || "無題"}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {memo.pinned && <Pin size={12} className="text-brand-400" />}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded p-0.5 transition-all hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`${memo.title || "メモ"} を削除`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {isDeadlineMemo(memo) && (
        <p className="mt-1 text-[11px] text-slate-500">
          締切: {formatDeadlineDateTime(memo.deadline_at!)}
        </p>
      )}
      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{memo.content || "内容なし"}</p>
      {memo.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {memo.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
