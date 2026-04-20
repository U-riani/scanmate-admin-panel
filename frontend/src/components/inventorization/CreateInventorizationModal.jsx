// frontend\src\components\inventorization\CreateInventorizationModal.jsx
import { useState } from "react";
import { useCreateInventorization } from "../../queries/inventorizationMutation";
// import { useWarehouseStore } from "../../store/warehouseStore";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import { mockPocketRoles } from "../../data/mockPocketRoles";
import { useAuthStore } from "../../store/authStore";

export default function CreateInventorizationModal({ open, onClose }) {
  const { mutate, isPending } = useCreateInventorization();
  const { data: users = [] } = usePocketUsers();
  // const { data: websiteUsers = [] } = useWebsiteUsers();
  const { data: warehouses = [] } = useWarehouses();
  // const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const allowedWarehouseIds = useAuthStore(
    (state) => state.user?.warehouses || [],
  );

  const [form, setForm] = useState({
    warehouse_id: "",
    name: "",
    type: "barcode",
    employees: [],
    description: "",
  });

  if (!open) return null;
  const allowedWarehouses = warehouses.filter((w) => {
    return allowedWarehouseIds.includes(w.id);
  });

  const allowedEmployees = users.filter((u) => {
    const role = mockPocketRoles.find((r) => r.id === u.role_id);

    return (
      (u.warehouses || []).includes(Number(form.warehouse_id)) &&
      role?.modules?.inventorization === true &&
      u.active === true
    );
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "warehouse_id" ? { employees: [] } : {}),
    }));
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
    // if (!currentWarehouseId) {
    //   alert("Please select a warehouse first.");
    //   return;
    // }
    console.log(form);
    mutate(
      {
        name: form.name,
        scan_type: form.type,
        warehouse_id: Number(form.warehouse_id),
        employees: form.employees,
        description: form.description,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({
            name: "",
            type: "barcode",
            employees: [],
            description: "",
          });
        },
      },
    );
  }

  console.log(form.employees);

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 460 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Inventorization</h2>
          <button className="glass-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label flex! items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--accent-cyan)" }}
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span>Warehouse</span>
            </label>

            <select
              className="glass-select"
              name="warehouse_id"
              value={form.warehouse_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select warehouse
              </option>
              {allowedWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Name</label>
            <input
              name="name"
              placeholder="Inventorization name"
              className="glass-input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label">Type</label>
            <select
              name="type"
              className="glass-select"
              value={form.type}
              onChange={handleChange}
            >
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
                <p
                  style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}
                >
                  No available employees for this warehouse
                </p>
              ) : (
                allowedEmployees.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2.5"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      className="glass-checkbox"
                      checked={form.employees.includes(u.id)}
                      onChange={() => toggleEmployee(u.id)}
                    />
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {u.username}
                    </span>
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
              disabled={
                !form.warehouse_id ||
                !form.name ||
                form.employees.length === 0 ||
                isPending
              }
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isPending ? "Creating…" : "Create Inventorization"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
