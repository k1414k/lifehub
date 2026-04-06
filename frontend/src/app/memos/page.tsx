"use client";

import { useState } from "react";
import { Plus, Pin, Search } from "lucide-react";
import MemoCard from "@/components/memos/MemoCard";
import MemoEditor from "@/components/memos/MemoEditor";
import { useMemos, useCreateMemo, useUpdateMemo, useDeleteMemo } from "@/hooks/useApi";
import { useActivityLogStore } from "@/stores/activityLogStore";
import type { Memo, MemoForm } from "@/types";

export default function MemosPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Memo | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: memos = [], isLoading } = useMemos(search || undefined);
  const createMemo  = useCreateMemo();
  const updateMemo  = useUpdateMemo();
  const deleteMemo  = useDeleteMemo();
  const addActivity = useActivityLogStore((state) => state.addItem);

  const pinned = memos.filter((m) => m.pinned);
  const others  = memos.filter((m) => !m.pinned);

  const handleSave = async (data: Partial<MemoForm>) => {
    if (selected) {
      const updated = await updateMemo.mutateAsync({ id: selected.id, data });
      setSelected(updated);
      addActivity(`「${updated.title || "無題"}」を保存しました`);
      return updated;
    } else {
      const created = await createMemo.mutateAsync(data);
      setSelected(created);
      setCreating(false);
      addActivity(`「${created.title || "無題"}」を作成しました`);
      return created;
    }
  };

  const handleDelete = async (id: number) => {
    const targetMemo = memos.find((memo) => memo.id === id);
    const title = targetMemo?.title || "無題";

    if (!window.confirm(`「${title}」を削除しますか？`)) return;

    await deleteMemo.mutateAsync(id);
    addActivity(`「${title}」を削除しました`);

    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 lg:min-h-0 lg:flex-row lg:gap-6">
      <div className="flex w-full shrink-0 flex-col gap-4 lg:min-h-0 lg:w-80">
        <div className="card flex flex-col gap-4 lg:min-h-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900 dark:text-slate-50 sm:text-2xl lg:text-xl">メモ</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">検索・整理しながらすばやく編集</p>
            </div>
            <button
              onClick={() => { setCreating(true); setSelected(null); }}
              className="btn-primary w-full justify-center sm:w-auto"
            >
              <Plus size={14} /> 新規
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              className="input pl-9 text-sm"
              placeholder="検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse p-4" />)
            ) : (
              <>
                {pinned.length > 0 && (
                  <>
                    <p className="flex items-center gap-1 px-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                      <Pin size={10} /> ピン留め
                    </p>
                    {pinned.map((m) => (
                      <MemoCard
                        key={m.id}
                        memo={m}
                        active={selected?.id === m.id}
                        onClick={() => { setSelected(m); setCreating(false); }}
                        onDelete={() => handleDelete(m.id)}
                      />
                    ))}
                    {others.length > 0 && <p className="px-1 pt-2 text-xs font-medium text-slate-400 dark:text-slate-500">すべて</p>}
                  </>
                )}
                {others.map((m) => (
                  <MemoCard
                    key={m.id}
                    memo={m}
                    active={selected?.id === m.id}
                    onClick={() => { setSelected(m); setCreating(false); }}
                    onDelete={() => handleDelete(m.id)}
                  />
                ))}
                {memos.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">メモがありません</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 lg:min-h-0">
        {(creating || selected) ? (
          <MemoEditor
            memo={selected ?? undefined}
            onSave={handleSave}
            onDelete={selected ? () => handleDelete(selected.id) : undefined}
            onClose={() => {
              setSelected(null);
              setCreating(false);
            }}
          />
        ) : (
          <div className="card flex min-h-[280px] items-center justify-center text-slate-400 dark:text-slate-500 lg:h-full">
            <div className="text-center">
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200">メモを選択または新規作成</p>
              <p className="mt-1 text-sm">一覧から選ぶか「新規」をタップしてください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
