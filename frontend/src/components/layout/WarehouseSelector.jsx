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

  // Auto-select if only one warehouse
  useEffect(() => {
    if (allowedWarehouses.length === 1) {
      if (currentWarehouseId !== allowedWarehouses[0].id) {
        setWarehouseId(allowedWarehouses[0].id);
      }
    }
  }, [allowedWarehouses, currentWarehouseId, setWarehouseId]);

  function handleChange(e) {
    const val = e.target.value;
    setWarehouseId(val === "" ? null : Number(val));
  }

  const selectedName =
    currentWarehouseId
      ? (allowedWarehouses.find((w) => w.id === currentWarehouseId)?.name ?? "Warehouse")
      : "All Warehouses";

  const hasMultiple = allowedWarehouses.length > 1;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.375rem 0.625rem",
        borderRadius: "0.75rem",
        background: "rgba(0,212,255,0.05)",
        border: "1px solid rgba(0,212,255,0.15)",
        cursor: hasMultiple ? "pointer" : "default",
        transition: "border-color 0.2s, background 0.2s",
        minWidth: 130,
      }}
    >
      {/* Warehouse icon */}
      <svg
        width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        style={{ color: "var(--accent-cyan)", flexShrink: 0 }}
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>

      {/* Label */}
      <span style={{ color: "var(--text-primary)", fontSize: "0.8125rem", fontWeight: 500, whiteSpace: "nowrap", flex: 1 }}>
        {selectedName}
      </span>

      {/* Chevron */}
      {hasMultiple && (
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      )}

      {/* Invisible native select covers the whole component for a11y + browser UX */}
      {hasMultiple && (
        <select
          value={currentWarehouseId ?? ""}
          onChange={handleChange}
          aria-label="Select warehouse"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            width: "100%",
            height: "100%",
            cursor: "pointer",
          }}
        >
          <option value="">All Warehouses</option>
          {allowedWarehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
