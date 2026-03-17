import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateInventorizationModal from "../../components/inventorization/CreateInventorizationModal";
import { useInventorizations } from "../../queries/inventorizationQuery";
import { useWarehouseStore } from "../../store/warehouseStore";
import { useWarehouses } from "../../queries/warehouseQuery";
import { PATHS } from "../../app/paths";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import StatusBadge from "../../components/documents/StatusBadge";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-9 w-40 rounded-lg" />
      </div>
      <div className="glass-card p-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            {[40, 120, 90, 60, 80, 100].map((w, j) => (
              <div key={j} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InventorizationList() {
  const { data: docs = [], isLoading } = useInventorizations();
  const { data: warehouses = [] } = useWarehouses();
  const { data: pocketUsers = [] } = usePocketUsers();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);

  if (isLoading) return <LoadingSkeleton />;

  const filtered = currentWarehouseId
    ? docs.filter((d) => d.warehouse_id === currentWarehouseId)
    : docs;

  function getWarehouseName(id) {
    return warehouses.find((w) => w.id === id)?.name ?? "—";
  }

  function getEmployeeNames(ids) {
    if (!ids?.length) return "—";
    return ids.map((id) => pocketUsers.find((u) => u.id === id)?.username ?? id).join(", ");
  }

  function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  }

  return (
    <div className="space-y-5">
      <CreateInventorizationModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Inventorization</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}{currentWarehouseId ? " in current warehouse" : " across all warehouses"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Inventorization
        </button>
      </div>

      {/* Table */}
      <div className="glass-card glass-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Warehouse</th>
              <th>Type</th>
              <th>Status</th>
              <th>Employees</th>
              <th>Created</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                  No inventorization documents found
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.id}>
                  <td className="cell-mono">{doc.id}</td>
                  <td style={{ fontWeight: 500 }}>{doc.name}</td>
                  <td className="cell-muted">{getWarehouseName(doc.warehouse_id)}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: "rgba(124,58,237,0.08)",
                        color: "#a78bfa",
                        border: "1px solid rgba(124,58,237,0.2)",
                      }}
                    >
                      {doc.type}
                    </span>
                  </td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td className="cell-muted" style={{ fontSize: "0.8125rem" }}>
                    {getEmployeeNames(doc.employees)}
                  </td>
                  <td className="cell-mono">{formatDate(doc.created_at)}</td>
                  <td className="cell-mono">{formatDate(doc.updated_at)}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(PATHS.INVENTORIZATION_DETAIL(doc.id))}
                    >
                      Open →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
