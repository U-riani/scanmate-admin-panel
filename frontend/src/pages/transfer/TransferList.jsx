import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransfers } from "../../queries/transferQuery";
import { PATHS } from "../../app/paths";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouseStore } from "../../store/warehouseStore";
import CreateTransferModal from "../../components/transfer/TransferCreateModal";
import StatusBadge from "../../components/documents/StatusBadge";

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-9 w-36 rounded-lg" />
      </div>
      <div className="glass-card">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            {[40, 120, 80, 80, 60, 80, 70, 70].map((w, j) => (
              <div key={j} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TransferList() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: docs = [], isLoading } = useTransfers();
  const { data: warehouses = [] } = useWarehouses();
  const { data: users = [] } = usePocketUsers();
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const navigate = useNavigate();

  if (isLoading) return <LoadingSkeleton />;

  const filtered = currentWarehouseId
    ? docs.filter((d) => d.from_warehouse_id === currentWarehouseId || d.to_warehouse_id === currentWarehouseId)
    : docs;

  function getWarehouseName(id) {
    return warehouses.find((w) => w.id === id)?.name ?? "—";
  }
  function getUserName(id) {
    return users.find((u) => u.id === id)?.username ?? "—";
  }
  function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  }

  return (
    <div className="space-y-5">
      <CreateTransferModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Transfers</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {filtered.length} transfer{filtered.length !== 1 ? "s" : ""}{currentWarehouseId ? " involving this warehouse" : " across all warehouses"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Transfer
        </button>
      </div>

      <div className="glass-card glass-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>From</th>
              <th>To</th>
              <th>Type</th>
              <th>Status</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                  No transfers found for this warehouse
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.id}>
                  <td className="cell-mono">{doc.id}</td>
                  <td style={{ fontWeight: 500 }}>{doc.name}</td>
                  <td className="cell-muted">{getWarehouseName(doc.from_warehouse_id)}</td>
                  <td className="cell-muted">{getWarehouseName(doc.to_warehouse_id)}</td>
                  <td>
                    <span className="badge badge-draft">{doc.type}</span>
                  </td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td className="cell-muted">{getUserName(doc.sender_user_id)}</td>
                  <td className="cell-muted">{getUserName(doc.receiver_user_id)}</td>
                  <td className="cell-mono">{formatDate(doc.created_at)}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(PATHS.TRANSFER_DETAIL(doc.id))}
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
