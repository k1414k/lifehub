"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import {
  buildLoginRedirectPath,
  getPostAuthRedirectPath,
  isPublicAuthPath,
} from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const nextPath = searchParams.get("next");
  const isPublicPath = isPublicAuthPath(pathname);

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const status = useAuthStore((state) => state.status);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!token) {
      if (!isPublicPath) {
        router.replace(buildLoginRedirectPath(pathname, search ? `?${search}` : ""));
      }

      return;
    }

    if (status === "authenticated") {
      if (isPublicPath) {
        router.replace(getPostAuthRedirectPath(nextPath));
      }

      return;
    }

    if (status !== "checking" || user) {
      return;
    }

    let cancelled = false;

    const restoreCurrentUser = async () => {
      try {
        const response = await api.get<User>("/me", { skipAuthRedirect: true });

        if (cancelled) {
          return;
        }

        setCurrentUser(response.data);

        if (isPublicPath) {
          router.replace(getPostAuthRedirectPath(nextPath));
        }
      } catch {
        if (cancelled) {
          return;
        }

        clearSession();

        if (!isPublicPath) {
          router.replace(buildLoginRedirectPath(pathname, search ? `?${search}` : ""));
        }
      }
    };

    void restoreCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [
    clearSession,
    hasHydrated,
    isPublicPath,
    nextPath,
    pathname,
    router,
    search,
    setCurrentUser,
    status,
    token,
    user,
  ]);

  if (!isPublicPath && (!hasHydrated || status !== "authenticated")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 text-sm text-slate-500">
        認証状態を確認しています...
      </div>
    );
  }

  return <>{children}</>;
}
