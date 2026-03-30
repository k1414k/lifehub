import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Transaction, TransactionForm, Memo, MemoForm, FileItem } from "@/types";

// ─── Transactions ──────────────────────────────────────────────
export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => api.get("/transactions").then((r) => r.data),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionForm) =>
      api.post("/transactions", { transaction: data }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
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
