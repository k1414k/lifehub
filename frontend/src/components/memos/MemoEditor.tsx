"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Pin, Trash2, Save, X } from "lucide-react";
import type { Memo } from "@/types";

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(memo?.title ?? "");
    setContent(memo?.content ?? "");
    setTags(memo?.tags ?? []);
    setPinned(memo?.pinned ?? false);
  }, [memo?.id]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ title, content, tags, pinned });
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
          <button onClick={handleSave} disabled={saving} className="btn-primary px-3 py-2" type="button">
            <Save size={14} />
            {saving ? "保存中..." : "保存"}
          </button>
        </div>

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
            <button onClick={handleSave} disabled={saving} className="btn-primary hidden py-1.5 lg:inline-flex" type="button">
              <Save size={14} />
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-full">
            {tag}
            <button onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
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
