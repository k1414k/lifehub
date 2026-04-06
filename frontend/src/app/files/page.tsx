"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Image, File, Trash2, Download, FolderOpen } from "lucide-react";
import { useFiles, useUploadFile, useDeleteFile } from "@/hooks/useApi";
import { useActivityLogStore } from "@/stores/activityLogStore";
import type { FileItem } from "@/types";

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <Image size={20} className="text-purple-500" />;
  if (type.includes("pdf"))       return <FileText size={20} className="text-red-500" />;
  return <File size={20} className="text-brand-500" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const { data: files = [], isLoading } = useFiles();
  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteFile();
  const addActivity = useActivityLogStore((state) => state.addItem);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) =>
      uploadMutation.mutate(file, {
        onSuccess: () => addActivity(`「${file.name}」をアップロードしました`),
      })
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">ファイル管理</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{files.length} 件のファイル</p>
        </div>
        <button onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending} className="btn-primary w-full justify-center sm:w-auto">
          <Upload size={16} />
          {uploadMutation.isPending ? "アップロード中..." : "アップロード"}
        </button>
        <input ref={inputRef} type="file" multiple className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10
          ${dragOver ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10" : "border-slate-200 hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"}`}
      >
        <FolderOpen size={32} className={`mx-auto mb-3 ${dragOver ? "text-brand-500" : "text-slate-300 dark:text-slate-600"}`} />
        <p className="text-sm text-slate-500 dark:text-slate-400">ドラッグ＆ドロップ、またはクリックして選択</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">最大 50MB / ファイル</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : files.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">ファイルがありません</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f: FileItem) => (
            <div key={f.id} className="card hover:shadow-card-hover transition-shadow group">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <FileIcon type={f.content_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{f.original_name}</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatBytes(f.byte_size)}</p>
                  <p className="mt-0.5 text-xs text-slate-300 dark:text-slate-600">
                    {new Date(f.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <a href={f.url} target="_blank" rel="noreferrer"
                  className="btn-ghost py-1 text-xs flex-1 justify-center">
                  <Download size={12} /> 開く
                </a>
                <button onClick={() => {
                  if (!window.confirm(`「${f.original_name}」を削除しますか？`)) return;
                  deleteMutation.mutate(f.id, {
                    onSuccess: () => addActivity(`「${f.original_name}」を削除しました`),
                  });
                }}
                  disabled={deleteMutation.isPending}
                  className="btn-ghost py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
