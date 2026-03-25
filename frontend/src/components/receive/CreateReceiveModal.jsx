import { useState } from "react";
import { useCreateReceive } from "../../queries/receiveMutation";
import { useWarehouseStore } from "../../store/warehouseStore";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import { mockPocketRoles } from "../../data/mockPocketRoles";

export default function CreateReceiveModal({ open, onClose }) {
  const { mutate, isPending } = useCreateReceive();
  const { data: users = [] } = usePocketUsers();
  const { data: warehouses = [] } = useWarehouses();
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const warehouse = warehouses.find((w) => w.id === currentWarehouseId);

  const [form, setForm] = useState({
    name: "", type: "barcode", employees: [], description: "",
  });

  if (!open) return null;

  const allowedEmployees = users.filter((u) => {
    const role = mockPocketRoles.find((r) => r.id === u.role_id);
    return (
      (u.warehouses || []).includes(currentWarehouseId) &&
      role?.modules?.receive === true &&
      u.active === true
    );
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleEmployee(id) {
    setForm((prev) => ({
      ...prev,
      employees: prev.employees.includes(id)
        ? prev.employees.filter((e) => e !== id)
        : [...prev.employees, id],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log(form)
    if (!currentWarehouseId) {
      alert("Please select a warehouse first.");
      return;
    }
    console.log(form)
    mutate(
      {
        name: form.name,
        type: form.type,
        warehouse_id: currentWarehouseId,
        receiver_user_ids: form.employees,
        description: form.description,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ name: "", type: "barcode", employees: [], description: "" });
        },
      }
    );
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 460 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Receive</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
          style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--accent-cyan)" }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
            Warehouse:{" "}
            <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
              {warehouse?.name || "Not selected"}
            </span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Name</label>
            <input
              name="name"
              placeholder="Receive name"
              className="glass-input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label">Type</label>
            <select name="type" className="glass-select" value={form.type} onChange={handleChange}>
              <option value="barcode">Barcode based</option>
              <option value="loots">Box based</option>
            </select>
          </div>

          <div>
            <label className="field-label">Assigned Employees</label>
            <div
              className="mt-1 rounded-xl p-3 space-y-2"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--glass-border)",
                maxHeight: 140,
                overflowY: "auto",
              }}
            >
              {allowedEmployees.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                  No available employees for this warehouse
                </p>
              ) : (
                allowedEmployees.map((u) => (
                  <label key={u.id} className="flex items-center gap-2.5" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      className="glass-checkbox"
                      checked={form.employees.includes(u.id)}
                      onChange={() => toggleEmployee(u.id)}
                    />
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{u.username}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              name="description"
              placeholder="Optional description"
              className="glass-textarea"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={!currentWarehouseId || isPending}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isPending ? "Creating…" : "Create Receive"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
