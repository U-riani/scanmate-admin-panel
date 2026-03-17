import { useState } from "react";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useDeleteWarehouse } from "../../queries/warehouseMutation";
import CreateWarehouseModal from "../../components/settings/CreateWarehouseModal";
import EditWarehouseModal from "../../components/settings/EditWarehouseModal";

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-36 rounded-lg" />
        <div className="skeleton h-9 w-44 rounded-lg" />
      </div>
      <div className="glass-card">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            {[40, 140, 80, 60, 80].map((w, j) => (
              <div key={j} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Warehouses() {
  const { data: warehouses = [], isLoading } = useWarehouses();
  const { mutate: deleteWarehouse } = useDeleteWarehouse();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  if (isLoading) return <LoadingSkeleton />;

  function handleDelete(w) {
    if (!window.confirm(`Delete warehouse "${w.name}"?`)) return;
    deleteWarehouse(w.id);
  }

  return (
    <div className="space-y-5">
      <CreateWarehouseModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditWarehouseModal warehouse={editing} open={!!editing} onClose={() => setEditing(null)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Warehouses</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {warehouses.length} warehouse{warehouses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Warehouse
        </button>
      </div>

      <div className="glass-card glass-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Code</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {warehouses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                  No warehouses yet
                </td>
              </tr>
            ) : (
              warehouses.map((w) => (
                <tr key={w.id}>
                  <td className="cell-mono">{w.id}</td>
                  <td style={{ fontWeight: 500 }}>{w.name}</td>
                  <td className="cell-mono">{w.code}</td>
                  <td>
                    <span className={`badge ${w.active ? "badge-active" : "badge-archived"}`}>
                      {w.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button className="btn btn-warning btn-sm" onClick={() => setEditing(w)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(w)}>
                        Delete
                      </button>
                    </div>
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
