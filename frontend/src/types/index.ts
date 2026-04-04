// ========== User ==========
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  data: User;
  errors?: string[];
}

// ========== Assets ==========
export interface AssetItem {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AssetForm {
  name: string;
  description?: string;
}

export interface AssetSnapshot {
  id: number;
  asset_item_id: number;
  amount: number | string;
  recorded_on: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetSnapshotForm {
  asset_item_id: number;
  amount: number;
  recorded_on: string;
  note?: string;
}

export interface AssetSnapshotBatchForm {
  recorded_on: string;
  note?: string;
  items: Array<{
    asset_item_id: number;
    amount: number;
    note?: string;
  }>;
}

// ========== Legacy Money ==========
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  transaction_type: TransactionType;
  category: string;
  date: string;
  note?: string;
  created_at: string;
}

export interface TransactionForm {
  title: string;
  amount: number;
  transaction_type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

// ========== Memos ==========
export type MemoType = "normal" | "deadline";

export interface Memo {
  id: number;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  memo_type: MemoType;
  deadline_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoForm {
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  memo_type: MemoType;
  deadline_at?: string | null;
}

// ========== Files ==========
export interface FileItem {
  id: number;
  name: string;
  original_name: string;
  content_type: string;
  byte_size: number;
  url: string;
  folder?: string;
  created_at: string;
}

// ========== API ==========
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
