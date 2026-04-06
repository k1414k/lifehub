"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferencesStore";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
