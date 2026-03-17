import { useState, useEffect } from "react";
import { useUpdateWarehouse } from "../../queries/warehouseMutation";

export default function EditWarehouseModal({ warehouse, open, onClose }) {
  const { mutate } = useUpdateWarehouse();
  const [form, setForm] = useState({ name: "", code: "", active: true });

  useEffect(() => {
    if (warehouse) setForm(warehouse);
  }, [warehouse]);

  if (!open || !warehouse) return null;

  function submit(e) {
    e.preventDefault();
    mutate({ id: warehouse.id, data: form });
    onClose();
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 420 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Edit Warehouse</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="field-label">Warehouse Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="glass-input"
            />
          </div>

          <div>
            <label className="field-label">Warehouse Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="glass-input font-mono"
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
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save Changes
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
