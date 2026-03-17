import { useState } from "react";
import { usePocketRoles } from "../../queries/pocketRolesQuery";
import { useUpdatePocketRole, useDeletePocketRole } from "../../queries/pocketRolesMutation";
import CreatePocketRoleModal from "../../components/users/CreatePocketRoleModal";

const POCKET_MODULES = ["inventorization", "transfer", "receive", "sales"];

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-36 rounded-lg" />
        <div className="skeleton h-9 w-36 rounded-lg" />
      </div>
      <div className="glass-card">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            {[100, 160, 60, 60, 60, 60, 70].map((w, j) => (
              <div key={j} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PocketRoles() {
  const { data: roles = [], isLoading } = usePocketRoles();
  const { mutate: updateRole } = useUpdatePocketRole();
  const { mutate: deleteRole } = useDeletePocketRole();
  const [openCreateModal, setOpenCreateModal] = useState(false);

  if (isLoading) return <LoadingSkeleton />;

  function togglePermission(role, moduleName) {
    updateRole({
      roleId: role.id,
      modules: { ...role.modules, [moduleName]: !role.modules[moduleName] },
    });
  }

  function handleDelete(role) {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    deleteRole(role.id);
  }

  return (
    <div className="space-y-5">
      <CreatePocketRoleModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Pocket Roles</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {roles.length} role{roles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpenCreateModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Role
        </button>
      </div>

      <div className="glass-card glass-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Role</th>
              <th style={{ textAlign: "left" }}>Description</th>
              {POCKET_MODULES.map((m) => (
                <th key={m} style={{ textAlign: "center", textTransform: "capitalize" }}>{m}</th>
              ))}
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={POCKET_MODULES.length + 3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td style={{ fontWeight: 600 }}>{role.name}</td>
                  <td className="cell-muted">{role.description || "—"}</td>
                  {POCKET_MODULES.map((module) => (
                    <td key={module} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className="glass-checkbox"
                        checked={!!role.modules[module]}
                        onChange={() => togglePermission(role, module)}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: "center" }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(role)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
