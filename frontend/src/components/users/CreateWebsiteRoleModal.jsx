import { useState } from "react";
import { useCreateWebsiteRole } from "../../queries/websiteRolesMutation";

const modulesList = [
  "dashboard",
  "website_users",
  "website_roles",
  "pocket_users",
  "pocket_roles",
  "warehouses",
  "settings",
  "reports",
];

export default function CreateWebsiteRoleModal({ open, onClose }) {
  const { mutate, isPending } = useCreateWebsiteRole();
  const [form, setForm] = useState({
    name: "",
    description: "",
    modules: modulesList.reduce((acc, m) => { acc[m] = false; return acc; }, {}),
    warehouses: [],
  });

  if (!open) return null;

  function toggleModule(module) {
    setForm((prev) => ({
      ...prev,
      modules: { ...prev.modules, [module]: !prev.modules[module] },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutate(form, { onSuccess: () => onClose() });
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 480 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Website Role</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Role Name</label>
            <input
              placeholder="e.g. Manager"
              className="glass-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <input
              placeholder="Optional description"
              className="glass-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Module Permissions</label>
            <div className="glass-card p-3 space-y-2 mt-1" style={{ background: "rgba(255,255,255,0.02)" }}>
              {modulesList.map((module) => (
                <label key={module} className="flex items-center gap-2.5" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    className="glass-checkbox"
                    checked={form.modules[module]}
                    onChange={() => toggleModule(module)}
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textTransform: "capitalize" }}>
                    {module.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
              {isPending ? "Creating…" : "Create Role"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
