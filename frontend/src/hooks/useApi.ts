import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  AssetItem,
  AssetForm,
  AssetSnapshot,
  AssetSnapshotForm,
  AssetSnapshotBatchForm,
  Memo,
  MemoForm,
  FileItem,
  MessageResponse,
  PasswordForm,
  ProfileForm,
  RecordResetFeature,
  UserResponse,
} from "@/types";

function invalidateAssetQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["assets"] });
  qc.invalidateQueries({ queryKey: ["asset_snapshots"] });
}

// ─── Assets ────────────────────────────────────────────────────
export function useAssets() {
  return useQuery<AssetItem[]>({
    queryKey: ["assets"],
    queryFn: () => api.get("/assets").then((r) => r.data),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssetForm) =>
      api.post("/assets", { asset: data }).then((r) => r.data),
    onSuccess: () => invalidateAssetQueries(qc),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetForm }) =>
      api.put(`/assets/${id}`, { asset: data }).then((r) => r.data),
    onSuccess: () => invalidateAssetQueries(qc),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/assets/${id}`),
    onSuccess: () => invalidateAssetQueries(qc),
  });
}

export function useAssetSnapshots(assetItemId?: number) {
  return useQuery<AssetSnapshot[]>({
    queryKey: ["asset_snapshots", assetItemId ?? "all"],
    queryFn: () =>
      api
        .get("/asset_snapshots", {
          params: assetItemId ? { asset_item_id: assetItemId } : {},
        })
        .then((r) => r.data),
  });
}

export function useCreateAssetSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssetSnapshotForm) =>
      api.post("/asset_snapshots", { asset_snapshot: data }).then((r) => r.data),
    onSuccess: () => invalidateAssetQueries(qc),
  });
}

export function useCreateAssetSnapshotBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssetSnapshotBatchForm) =>
      api.post("/asset_snapshots/bulk_create", { asset_snapshot_batch: data }).then((r) => r.data),
    onSuccess: () => invalidateAssetQueries(qc),
  });
}

export function useUpdateAssetSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssetSnapshotForm> }) =>
      api.put(`/asset_snapshots/${id}`, { asset_snapshot: data }).then((r) => r.data),
    onSuccess: () => invalidateAssetQueries(qc),
  });
}

export function useDeleteAssetSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/asset_snapshots/${id}`),
    onSuccess: () => invalidateAssetQueries(qc),
  });
}

// ─── Memos ─────────────────────────────────────────────────────
export function useMemos(q?: string) {
  return useQuery<Memo[]>({
    queryKey: ["memos", q],
    queryFn: () => api.get("/memos", { params: q ? { q } : {} }).then((r) => r.data),
  });
}

export function useCreateMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MemoForm>) =>
      api.post("/memos", { memo: data }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memos"] }),
  });
}

export function useUpdateMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MemoForm> }) =>
      api.put(`/memos/${id}`, { memo: data }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memos"] }),
  });
}

export function useDeleteMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/memos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memos"] }),
  });
}

// ─── Files ─────────────────────────────────────────────────────
export function useFiles() {
  return useQuery<FileItem[]>({
    queryKey: ["files"],
    queryFn: () => api.get("/files").then((r) => r.data),
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file[file]", file);
      return api.post("/files", fd, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/files/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
}

// ─── Settings / Account ────────────────────────────────────────
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: ProfileForm) =>
      api.patch<UserResponse>("/me", { user: data }).then((r) => r.data),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: PasswordForm) =>
      api.patch<MessageResponse>("/me/password", { user: data }).then((r) => r.data),
  });
}

export function useResetRecords() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (feature: RecordResetFeature) =>
      api.delete<MessageResponse>(`/records/${feature}`).then((r) => r.data),
    onSuccess: (_, feature) => {
      if (feature === "assets") {
        invalidateAssetQueries(qc);
      }

      if (feature === "memos") {
        qc.invalidateQueries({ queryKey: ["memos"] });
      }

      if (feature === "files") {
        qc.invalidateQueries({ queryKey: ["files"] });
      }
    },
  });
}
