import { useState, useEffect } from "react";
import { useUpdatePocketUser } from "../../queries/pocketUsersMutation";
import { usePocketRoles } from "../../queries/pocketRolesQuery";
import { useWarehouses } from "../../queries/warehouseQuery";

export default function EditUserModal({ user, open, onClose }) {
  const { mutate } = useUpdatePocketUser();
  const { data: roles = [] } = usePocketRoles();
  const { data: warehouses = [] } = useWarehouses();

  const [form, setForm] = useState({
    username: "", role_id: "", warehouses: [], active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        role_id: user.role_id || "",
        warehouses: user.warehouses || [],
        active: user.active ?? true,
      });
    }
  }, [user]);

  if (!open || !user) return null;

  function handleSubmit(e) {
    e.preventDefault();
    mutate({ id: user.id, data: form });
    onClose();
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 420 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Edit Pocket User</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Username</label>
            <input
              value={form.username}
              className="glass-input"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Role</label>
            <select
              value={form.role_id}
              className="glass-select"
              onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
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

          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Last login: {user.last_login || "Never"}
          </p>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
