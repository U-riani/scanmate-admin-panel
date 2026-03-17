import { useState } from "react";
import { useCreatePocketUser } from "../../queries/pocketUsersMutation";
import { usePocketRoles } from "../../queries/pocketRolesQuery";
import { useWarehouses } from "../../queries/warehouseQuery";

export default function CreatePocketUserModal({ open, onClose }) {
  const { mutate, isPending } = useCreatePocketUser();
  const { data: roles = [] } = usePocketRoles();
  const { data: warehouses = [] } = useWarehouses();

  const [form, setForm] = useState({
    username: "", password: "", role_id: "", warehouses: [], active: true,
  });

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutate(form, { onSuccess: () => onClose() });
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 420 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Pocket User</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Username</label>
            <input
              name="username"
              placeholder="Username"
              className="glass-input"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label">Initial Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="glass-input"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label">Role</label>
            <select
              name="role_id"
              className="glass-select"
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
              required
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Warehouses</label>
            <div className="space-y-1.5 mt-1">
              {warehouses.map((w) => (
                <label key={w.id} className="flex items-center gap-2.5" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    className="glass-checkbox"
                    checked={(form.warehouses || []).includes(w.id)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        warehouses: e.target.checked
                          ? [...(form.warehouses || []), w.id]
                          : (form.warehouses || []).filter((id) => id !== w.id),
                      })
                    }
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{w.name}</span>
                </label>
              ))}
              {warehouses.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>No warehouses found</p>
              )}
            </div>
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
              {isPending ? "Creating…" : "Create User"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
