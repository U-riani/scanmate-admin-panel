import { useAuthStore } from "../../store/authStore";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useTransfers } from "../../queries/transferQuery";
import { useInventorizations } from "../../queries/inventorizationQuery";
import { useWarehouseStore } from "../../store/warehouseStore";

function StatCard({ label, value, sub, accentColor = "var(--accent-cyan)", icon }) {
  return (
    <div
      className="glass-card glass-card-hover p-5 flex flex-col gap-3"
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between">
        <p className="section-label">{label}</p>
        <span style={{ color: accentColor, opacity: 0.5 }}>{icon}</span>
      </div>
      <p
        className="font-mono"
        style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{sub}</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const { data: warehouses = [] } = useWarehouses();
  const { data: transfers = [] } = useTransfers();
  const { data: inventorizations = [] } = useInventorizations();

  const currentWarehouse = warehouses.find((w) => w.id === currentWarehouseId);

  const activeTransfers = transfers.filter(
    (t) =>
      (t.from_warehouse_id === currentWarehouseId || t.to_warehouse_id === currentWarehouseId) &&
      t.status !== "closed",
  ).length;

  const activeInventorizations = inventorizations.filter(
    (d) => d.warehouse_id === currentWarehouseId && d.status !== "closed",
  ).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">{greeting}, {user?.username || "Operator"}</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.875rem" }}>
          {currentWarehouse
            ? `Viewing data for ${currentWarehouse.name}`
            : "Select a warehouse to begin"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Transfers"
          value={activeTransfers}
          sub="In current warehouse"
          accentColor="var(--accent-cyan)"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          }
        />
        <StatCard
          label="Active Inventorizations"
          value={activeInventorizations}
          sub="In current warehouse"
          accentColor="var(--accent-purple)"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
            </svg>
          }
        />
        <StatCard
          label="Total Warehouses"
          value={warehouses.length}
          sub="Across all locations"
          accentColor="#34d399"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          }
        />
        <StatCard
          label="Role"
          value={user?.role?.name?.replace("_", " ") || "—"}
          sub="Your access level"
          accentColor="#fbbf24"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          }
        />
      </div>

      {/* Quick status banner */}
      <div
        className="glass-card p-4 flex items-center gap-3"
        style={{ borderLeft: "3px solid var(--accent-cyan)" }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }}
        />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          System operational — all services running normally
        </p>
      </div>
    </div>
  );
}
