import { useState } from "react";
import { useCreateWarehouse } from "../../queries/warehouseMutation";

export default function CreateWarehouseModal({ open, onClose }) {
  const { mutate, isPending } = useCreateWarehouse();
  const [form, setForm] = useState({ name: "", code: "", active: true });

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    mutate(form, {
      onSuccess: () => {
        setForm({ name: "", code: "", active: true });
        onClose();
      },
    });
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 420 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Warehouse</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Warehouse Name</label>
            <input
              placeholder="e.g. Main Warehouse"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="glass-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Warehouse Code</label>
            <input
              placeholder="e.g. WH-001"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="glass-input font-mono"
              required
            />
          </div>

          <label className="flex items-center gap-2.5" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              className="glass-checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Active</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
              {isPending ? "Creating…" : "Create Warehouse"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
