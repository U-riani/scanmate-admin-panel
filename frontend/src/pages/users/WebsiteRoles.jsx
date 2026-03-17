import { useState } from "react";
import { useWebsiteRoles } from "../../queries/websiteRolesQuery";
import { useUpdateWebsiteRole, useDeleteWebsiteRole } from "../../queries/websiteRolesMutation";
import { usePermission } from "../../hooks/usePermission";
import { MODULES } from "../../config/modules";
import CreateWebsiteRoleModal from "../../components/users/CreateWebsiteRoleModal";

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-9 w-36 rounded-lg" />
      </div>
      <div className="glass-card">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            {[100, 60, 60, 60, 60, 60, 60, 60, 60, 70].map((w, j) => (
              <div key={j} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WebsiteRoles() {
  const { data: roles = [], isLoading } = useWebsiteRoles();
  const { mutate: updateRole } = useUpdateWebsiteRole();
  const { mutate: deleteRole } = useDeleteWebsiteRole();
  const canEditRoles = usePermission("website_roles");
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) return <LoadingSkeleton />;

  function toggle(role, module) {
    updateRole({
      roleId: role.id,
      data: { modules: { ...role.modules, [module]: !role.modules[module] } },
    });
  }

  function handleDelete(role) {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    deleteRole(role.id);
  }

  return (
    <div className="space-y-5">
      <CreateWebsiteRoleModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Website Roles</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {roles.length} role{roles.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canEditRoles && (
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Role
          </button>
        )}
      </div>

      <div className="glass-card glass-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Role</th>
              {MODULES.map((m) => (
                <th key={m} style={{ textAlign: "center", textTransform: "capitalize", fontSize: "0.72rem" }}>
                  {m.replace(/_/g, " ")}
                </th>
              ))}
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={MODULES.length + 2} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td style={{ fontWeight: 600 }}>{role.name}</td>
                  {MODULES.map((module) => (
                    <td key={module} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className="glass-checkbox"
                        checked={!!role.modules[module]}
                        onChange={() => toggle(role, module)}
                        disabled={!canEditRoles}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: "center" }}>
                    {canEditRoles && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(role)}>
                        Delete
                      </button>
                    )}
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
