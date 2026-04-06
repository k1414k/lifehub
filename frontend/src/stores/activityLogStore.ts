"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ActivityLogItem {
  id: string;
  message: string;
  created_at: string;
}

interface ActivityLogState {
  items: ActivityLogItem[];
  addItem: (message: string) => void;
  clearItems: () => void;
}

export const useActivityLogStore = create<ActivityLogState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (message) =>
        set((state) => ({
          items: [
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
              message,
              created_at: new Date().toISOString(),
            },
            ...state.items,
          ].slice(0, 4),
        })),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: "activity-log-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items.slice(0, 4) }),
    }
  )
);
