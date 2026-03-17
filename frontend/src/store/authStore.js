import { create } from "zustand";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { clearAuthStorage, getStorageJson, getStorageValue, setStorageJson, setStorageValue } from "../utils/storage";

export const useAuthStore = create((set) => ({
  user: getStorageJson(STORAGE_KEYS.USER, null),
  token: getStorageValue(STORAGE_KEYS.TOKEN, null),

  setSession: ({ user, token }) => {
    setStorageJson(STORAGE_KEYS.USER, user);
    if (token) {
      setStorageValue(STORAGE_KEYS.TOKEN, token);
    }
    set({ user, token: token || null });
  },

  setUser: (user) => {
    setStorageJson(STORAGE_KEYS.USER, user);
    set({ user });
  },

  logout: () => {
    clearAuthStorage();
    set({ user: null, token: null });
  },
}));
