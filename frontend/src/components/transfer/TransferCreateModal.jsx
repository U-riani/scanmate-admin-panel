import { useState } from "react";
import { useCreateTransfer } from "../../queries/transferCreateMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouseStore } from "../../store/warehouseStore";

export default function CreateTransferModal({ open, onClose }) {
  const { data: warehouses = [] } = useWarehouses();
  const { data: users = [] } = usePocketUsers();
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const createMutation = useCreateTransfer();

  const [form, setForm] = useState({
    name: "",
    number: "",
    from_warehouse_id: currentWarehouseId,
    to_warehouse_id: "",
    type: "barcode",
    sender_user_id: "",
    receiver_user_id: "",
  });

  if (!open) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        setForm({
          name: "", number: "",
          from_warehouse_id: currentWarehouseId,
          to_warehouse_id: "", type: "barcode",
          sender_user_id: "", receiver_user_id: "",
        });
        onClose();
      },
    });
  }

  const otherWarehouses = warehouses.filter((w) => w.id !== currentWarehouseId);

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Transfer</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Transfer Name</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. March Restock"
              className="glass-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Transfer Number</label>
            <input
              value={form.number}
              onChange={(e) => updateField("number", e.target.value)}
              placeholder="e.g. TR-2025-001"
              className="glass-input font-mono"
              required
            />
          </div>

          <div>
            <label className="field-label">From Warehouse</label>
            <select
              value={form.from_warehouse_id}
              disabled
              className="glass-select"
              style={{ opacity: 0.6 }}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">To Warehouse</label>
            <select
              value={form.to_warehouse_id}
              onChange={(e) => updateField("to_warehouse_id", Number(e.target.value))}
              className="glass-select"
              required
            >
              <option value="">Select destination</option>
              {otherWarehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Transfer Type</label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="glass-select"
            >
              <option value="barcode">Barcode</option>
              <option value="box">Box</option>
            </select>
          </div>

          <div>
            <label className="field-label">Sender User</label>
            <select
              value={form.sender_user_id}
              onChange={(e) => updateField("sender_user_id", Number(e.target.value))}
              className="glass-select"
              required
            >
              <option value="">Select sender</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Receiver User</label>
            <select
              value={form.receiver_user_id}
              onChange={(e) => updateField("receiver_user_id", Number(e.target.value))}
              className="glass-select"
              required
            >
              <option value="">Select receiver</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {createMutation.isPending ? "Creating…" : "Create Transfer"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
