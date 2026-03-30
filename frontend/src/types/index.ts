// ========== User ==========
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

// ========== Money ==========
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
export interface Memo {
  id: number;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemoForm {
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
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
