import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoleType, UserPublic, AuthTokens } from '@/types';

interface AuthState {
  user: UserPublic | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: UserPublic, tokens: AuthTokens) => void;
  setActiveRole: (role: RoleType) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, isLoading: false }),

      setActiveRole: (role) =>
        set((state) =>
          state.user ? { user: { ...state.user, activeRole: role } } : {}
        ),

      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "seapedia-auth",
      // Only persist tokens and minimal user data; re-fetch full profile on mount
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
