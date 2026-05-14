"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";

type AuthState = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setAuth: (user, token) => {
    localStorage.setItem("ehiseb_token", token);
    localStorage.setItem("ehiseb_user", JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("ehiseb_token");
    localStorage.removeItem("ehiseb_user");
    set({ user: null, token: null });
  },
  hydrate: () => {
    const token = localStorage.getItem("ehiseb_token");
    const rawUser = localStorage.getItem("ehiseb_user");
    set({
      token,
      user: rawUser ? (JSON.parse(rawUser) as User) : null,
      hydrated: true,
    });
  },
}));
