import { useEffect, useState } from "react";
import { useUpdateWebsiteUser } from "../../queries/websiteUsersMutation";
import { useWebsiteRoles } from "../../queries/websiteRolesQuery";
import { useWarehouses } from "../../queries/warehouseQuery";

export default function EditWebsiteUserModal({ user, open, onClose }) {
  const { mutate, isPending } = useUpdateWebsiteUser();
  const { data: roles = [] } = useWebsiteRoles();
  const { data: warehouses = [] } = useWarehouses();

  const [form, setForm] = useState({
    username: "", email: "", role_id: 2, warehouses: [], active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        role_id: user.role_id || 2,
        warehouses: user.warehouses || [],
        active: user.active ?? true,
      });
    }
  }, [user]);

  if (!open || !user) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function toggleWarehouse(id) {
    setForm((prev) => ({
      ...prev,
      warehouses: (prev.warehouses || []).includes(id)
        ? (prev.warehouses || []).filter((w) => w !== id)
        : [...(prev.warehouses || []), id],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutate({ id: user.id, data: form }, { onSuccess: () => onClose() });
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 460 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Edit Website User</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Username</label>
            <input name="username" value={form.username} onChange={handleChange}
              placeholder="Username" className="glass-input" required />
          </div>

          <div>
            <label className="field-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="user@example.com" className="glass-input" required />
          </div>

          <div>
            <label className="field-label">Role</label>
            <select name="role_id" value={form.role_id} onChange={handleChange} className="glass-select">
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
                    onChange={() => toggleWarehouse(w.id)}
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{w.name}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5" style={{ cursor: "pointer" }}>
            <input name="active" type="checkbox" className="glass-checkbox" checked={form.active} onChange={handleChange} />
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Active</span>
          </label>

          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Last login: {user.last_login || "Never"}
          </p>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
              {isPending ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
