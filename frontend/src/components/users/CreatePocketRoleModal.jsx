import { useState } from "react";
import { useCreatePocketRole } from "../../queries/pocketRolesMutation";

const POCKET_MODULES = ["inventorization", "transfer", "receive", "sales"];

export default function CreatePocketRoleModal({ open, onClose }) {
  const { mutate, isPending } = useCreatePocketRole();
  const [form, setForm] = useState({
    name: "",
    description: "",
    modules: { inventorization: false, transfer: false, receive: false, sales: false },
  });

  if (!open) return null;

  function toggleModule(moduleName) {
    setForm((prev) => ({
      ...prev,
      modules: { ...prev.modules, [moduleName]: !prev.modules[moduleName] },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutate(form, {
      onSuccess: () => {
        setForm({ name: "", description: "", modules: { inventorization: false, transfer: false, receive: false, sales: false } });
        onClose();
      },
    });
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 440 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Pocket Role</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Role Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Warehouse Staff"
              className="glass-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              className="glass-input"
            />
          </div>

          <div>
            <label className="field-label">Module Permissions</label>
            <div className="glass-card p-3 space-y-2 mt-1" style={{ background: "rgba(255,255,255,0.02)" }}>
              {POCKET_MODULES.map((module) => (
                <label key={module} className="flex items-center gap-2.5" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    className="glass-checkbox"
                    checked={form.modules[module]}
                    onChange={() => toggleModule(module)}
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textTransform: "capitalize" }}>
                    {module}
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
