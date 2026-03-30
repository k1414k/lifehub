"use client";

import { useState, useEffect } from "react";
import { Pin, Trash2, Save, X } from "lucide-react";
import type { Memo } from "@/types";

interface Props {
  memo?: Memo;
  onSave: (data: Partial<Memo>) => Promise<void>;
  onDelete?: () => void;
}

export default function MemoEditor({ memo, onSave, onDelete }: Props) {
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
    <div className="card h-full flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <input
          className="text-xl font-display font-bold text-slate-900 bg-transparent outline-none flex-1 placeholder:text-slate-300"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPinned((p) => !p)}
            className={`p-2 rounded-xl transition-colors ${pinned ? "bg-brand-50 text-brand-600" : "hover:bg-slate-100 text-slate-400"}`}
            title="ピン留め"
          >
            <Pin size={16} />
          </button>
          {onDelete && (
            <button onClick={onDelete} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary py-1.5">
            <Save size={14} />
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {/* Tags */}
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
          className="text-xs border border-slate-200 rounded-full px-3 py-1 outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400"
          placeholder="タグを追加..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          onBlur={addTag}
        />
      </div>

      {/* Content */}
      <textarea
        className="flex-1 text-sm text-slate-700 leading-relaxed bg-transparent outline-none resize-none placeholder:text-slate-300"
        placeholder="ここにメモを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
