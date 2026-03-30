"use client";

import { Pin, Trash2 } from "lucide-react";
import type { Memo } from "@/types";

interface Props {
  memo: Memo;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function MemoCard({ memo, active, onClick, onDelete }: Props) {
  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer p-3 group transition-all duration-150
        ${active ? "ring-2 ring-brand-400 shadow-card-hover" : "hover:shadow-card-hover"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800 truncate flex-1">
          {memo.title || "無題"}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {memo.pinned && <Pin size={12} className="text-brand-400" />}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
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
