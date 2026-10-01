import { create } from "zustand";

import type { AuthUser } from "@/schemas/auth";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: state.isAuthenticated || Boolean(user),
    })),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
