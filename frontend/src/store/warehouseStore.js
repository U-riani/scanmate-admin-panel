import { create } from "zustand";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getStorageNumber, removeStorageValue, setStorageValue } from "../utils/storage";

export const useWarehouseStore = create((set) => ({
  currentWarehouseId: getStorageNumber(STORAGE_KEYS.WAREHOUSE_ID, null),

  setWarehouseId: (warehouseId) => {
    if (warehouseId === null) {
      removeStorageValue(STORAGE_KEYS.WAREHOUSE_ID);
      set({ currentWarehouseId: null });
      return;
    }

    setStorageValue(STORAGE_KEYS.WAREHOUSE_ID, warehouseId);
    set({ currentWarehouseId: Number(warehouseId) });
  },

  clearWarehouse: () => {
    removeStorageValue(STORAGE_KEYS.WAREHOUSE_ID);
    set({ currentWarehouseId: null });
  },
}));
