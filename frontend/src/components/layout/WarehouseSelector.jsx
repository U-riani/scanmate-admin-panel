// src/components/layout/WarehouseSelector.jsx

import { useEffect } from "react";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useWarehouseStore } from "../../store/warehouseStore";
import { useAuthStore } from "../../store/authStore";

export default function WarehouseSelector() {
  const { data: warehouses = [] } = useWarehouses();
  const user = useAuthStore((s) => s.user);

  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const setWarehouseId = useWarehouseStore((s) => s.setWarehouseId);

  const allowedWarehouses = warehouses.filter((w) =>
    (user?.warehouses || []).includes(w.id),
  );

  useEffect(() => {
    if (!allowedWarehouses.length) return;

    // Case 1: user has exactly ONE warehouse → auto select
    if (allowedWarehouses.length === 1) {
      if (currentWarehouseId !== allowedWarehouses[0].id) {
        setWarehouseId(allowedWarehouses[0].id);
      }

      return;
    }

    // Case 2: user has multiple warehouses
    // if stored warehouse is invalid → reset
    const stillAllowed = allowedWarehouses.some(
      (w) => w.id === currentWarehouseId,
    );

    if (!stillAllowed) {
      setWarehouseId(null);
    }
  }, [allowedWarehouses, currentWarehouseId, setWarehouseId]);

  function handleChange(e) {
    setWarehouseId(Number(e.target.value));
  }

  const disabled = allowedWarehouses.length <= 1;

  return (
    <select
      value={currentWarehouseId || ""}
      onChange={handleChange}
      disabled={disabled}
      className="border rounded px-2 py-1 text-sm"
    >
      {allowedWarehouses.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  );
}
