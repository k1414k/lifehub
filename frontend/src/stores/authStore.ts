import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clearAuthSessionCookie, setAuthSessionCookie } from "@/lib/authSession";
import type { User } from "@/types";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  hasHydrated: boolean;
  markHydrated: () => void;
  setSession: (user: User, token: string) => void;
  setCurrentUser: (user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: "checking",
      hasHydrated: false,
      markHydrated: () =>
        set((state) => ({
          hasHydrated: true,
          status: state.token ? "checking" : "unauthenticated",
        })),
      setSession: (user, token) => {
        setAuthSessionCookie();
        set({ user, token, status: "authenticated" });
      },
      setCurrentUser: (user) => set({ user, status: "authenticated" }),
      clearSession: () => {
        clearAuthSessionCookie();
        set((state) => ({
          user: null,
          token: null,
          status: "unauthenticated",
          hasHydrated: state.hasHydrated,
        }));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state, error) => {
        state?.markHydrated();

        if (error) {
          state?.clearSession();
        }
      },
    }
  )
);
