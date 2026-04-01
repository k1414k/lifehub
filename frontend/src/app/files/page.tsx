"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Image, File, Trash2, Download, FolderOpen } from "lucide-react";
import { useFiles, useUploadFile, useDeleteFile } from "@/hooks/useApi";
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
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((f) => uploadMutation.mutate(f));
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 sm:text-2xl">ファイル管理</h1>
          <p className="text-sm text-slate-500 mt-1">{files.length} 件のファイル</p>
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
          ${dragOver ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"}`}
      >
        <FolderOpen size={32} className={`mx-auto mb-3 ${dragOver ? "text-brand-500" : "text-slate-300"}`} />
        <p className="text-sm text-slate-500">ドラッグ＆ドロップ、またはクリックして選択</p>
        <p className="text-xs text-slate-400 mt-1">最大 50MB / ファイル</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">ファイルがありません</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f: FileItem) => (
            <div key={f.id} className="card hover:shadow-card-hover transition-shadow group">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-50">
                  <FileIcon type={f.content_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.original_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatBytes(f.byte_size)}</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {new Date(f.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <a href={f.url} target="_blank" rel="noreferrer"
                  className="btn-ghost py-1 text-xs flex-1 justify-center">
                  <Download size={12} /> 開く
                </a>
                <button onClick={() => deleteMutation.mutate(f.id)}
                  disabled={deleteMutation.isPending}
                  className="btn-ghost py-1 text-xs text-red-500 hover:bg-red-50">
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
