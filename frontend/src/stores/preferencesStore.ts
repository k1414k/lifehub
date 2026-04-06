"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

const MEMO_FONT_SIZE_MIN = 16;
const MEMO_FONT_SIZE_MAX = 48;
const MEMO_FONT_SIZE_STEP = 4;

function clampMemoFontSize(size: number) {
  if (!Number.isFinite(size)) return MEMO_FONT_SIZE_MIN;

  const normalized =
    Math.round(size / MEMO_FONT_SIZE_STEP) * MEMO_FONT_SIZE_STEP;

  return Math.min(
    MEMO_FONT_SIZE_MAX,
    Math.max(MEMO_FONT_SIZE_MIN, normalized)
  );
}

interface PreferencesState {
  theme: ThemeMode;
  memoFontSize: number;
  setTheme: (theme: ThemeMode) => void;
  setMemoFontSize: (size: number) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "light",
      memoFontSize: MEMO_FONT_SIZE_MIN,
      setTheme: (theme) => set({ theme }),
      setMemoFontSize: (size) =>
        set({ memoFontSize: clampMemoFontSize(size) }),
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        memoFontSize: clampMemoFontSize(state.memoFontSize),
      }),
    }
  )
);

export const memoFontSizeOptions = Array.from(
  {
    length:
      (MEMO_FONT_SIZE_MAX - MEMO_FONT_SIZE_MIN) / MEMO_FONT_SIZE_STEP + 1,
  },
  (_, index) => MEMO_FONT_SIZE_MIN + index * MEMO_FONT_SIZE_STEP
);
