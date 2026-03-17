import { STORAGE_KEYS } from "../constants/storageKeys";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStorageJson(key, fallback = null) {
  if (!isBrowser()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageJson(key, value) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStorageNumber(key, fallback = null) {
  if (!isBrowser()) return fallback;

  const value = window.localStorage.getItem(key);
  if (value === null || value === "") return fallback;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function getStorageValue(key, fallback = null) {
  if (!isBrowser()) return fallback;
  const value = window.localStorage.getItem(key);
  return value ?? fallback;
}

export function setStorageValue(key, value) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, String(value));
}

export function removeStorageValue(key) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export function clearAuthStorage() {
  removeStorageValue(STORAGE_KEYS.USER);
  removeStorageValue(STORAGE_KEYS.TOKEN);
  removeStorageValue(STORAGE_KEYS.WAREHOUSE_ID);
}
