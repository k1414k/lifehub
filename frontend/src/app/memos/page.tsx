"use client";

import { useState } from "react";
import { Plus, Pin, Search } from "lucide-react";
import MemoCard from "@/components/memos/MemoCard";
import MemoEditor from "@/components/memos/MemoEditor";
import { useMemos, useCreateMemo, useUpdateMemo, useDeleteMemo } from "@/hooks/useApi";
import type { Memo, MemoForm } from "@/types";

export default function MemosPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Memo | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: memos = [], isLoading } = useMemos(search || undefined);
  const createMemo  = useCreateMemo();
  const updateMemo  = useUpdateMemo();
  const deleteMemo  = useDeleteMemo();

  const pinned = memos.filter((m) => m.pinned);
  const others  = memos.filter((m) => !m.pinned);

  const handleSave = async (data: Partial<MemoForm>) => {
    if (selected) {
      const updated = await updateMemo.mutateAsync({ id: selected.id, data });
      setSelected(updated);
    } else {
      const created = await createMemo.mutateAsync(data);
      setSelected(created);
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMemo.mutateAsync(id);
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="flex h-full gap-6 -m-6 p-6">
      {/* Left: List */}
      <div className="w-72 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-slate-900">メモ</h1>
          <button onClick={() => { setCreating(true); setSelected(null); }} className="btn-primary py-1.5 text-xs">
            <Plus size={14} /> 新規
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-8 py-2 text-sm" placeholder="検索..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1 px-1">
                    <Pin size={10} /> ピン留め
                  </p>
                  {pinned.map((m) => (
                    <MemoCard key={m.id} memo={m} active={selected?.id === m.id}
                      onClick={() => { setSelected(m); setCreating(false); }}
                      onDelete={() => handleDelete(m.id)} />
                  ))}
                  {others.length > 0 && <p className="text-xs font-medium text-slate-400 px-1 pt-2">すべて</p>}
                </>
              )}
              {others.map((m) => (
                <MemoCard key={m.id} memo={m} active={selected?.id === m.id}
                  onClick={() => { setSelected(m); setCreating(false); }}
                  onDelete={() => handleDelete(m.id)} />
              ))}
              {memos.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">メモがありません</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="flex-1">
        {(creating || selected) ? (
          <MemoEditor
            memo={selected ?? undefined}
            onSave={handleSave}
            onDelete={selected ? () => handleDelete(selected.id) : undefined}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-lg font-medium">メモを選択または新規作成</p>
              <p className="text-sm mt-1">左側から選ぶか「新規」をクリック</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
