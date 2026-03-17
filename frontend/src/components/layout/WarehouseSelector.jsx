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
    if (allowedWarehouses.length === 1) {
      if (currentWarehouseId !== allowedWarehouses[0].id) setWarehouseId(allowedWarehouses[0].id);
      return;
    }
    const stillAllowed = allowedWarehouses.some((w) => w.id === currentWarehouseId);
    if (!stillAllowed) setWarehouseId(null);
  }, [allowedWarehouses, currentWarehouseId, setWarehouseId]);

  function handleChange(e) {
    setWarehouseId(Number(e.target.value));
  }

  const disabled = allowedWarehouses.length <= 1;

  return (
    <div className="relative flex items-center gap-1.5">
      <svg
        width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        style={{ color: "var(--text-muted)", flexShrink: 0 }}
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <select
        value={currentWarehouseId || ""}
        onChange={handleChange}
        disabled={disabled}
        className="glass-select"
        style={{ width: "auto", minWidth: "130px", fontSize: "0.8125rem", padding: "0.35rem 2rem 0.35rem 0.5rem" }}
      >
        {allowedWarehouses.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
    </div>
  );
}
