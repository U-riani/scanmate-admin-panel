import { useState } from "react";
import { useWebsiteUsers } from "../../queries/websiteUsersQuery";
import { useDeleteWebsiteUser } from "../../queries/websiteUsersMutation";
import { useWebsiteRoles } from "../../queries/websiteRolesQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import CreateWebsiteUserModal from "../../components/users/CreateWebsiteUserModal";
import EditWebsiteUserModal from "../../components/users/EditWebsiteUserModal";
import ResetWebsitePasswordModal from "../../components/users/ResetWebsitePasswordModal";

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-9 w-36 rounded-lg" />
      </div>
      <div className="glass-card">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            {[40, 100, 140, 80, 60, 100, 90, 100].map((w, j) => (
              <div key={j} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WebsiteUsers() {
  const { data: users = [], isLoading } = useWebsiteUsers();
  const { mutate: deleteUser } = useDeleteWebsiteUser();
  const { data: roles = [] } = useWebsiteRoles();
  const { data: warehouses = [] } = useWarehouses();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);

  if (isLoading) return <LoadingSkeleton />;

  function handleDelete(user) {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    deleteUser(user.id);
  }

  function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  }

  return (
    <div className="space-y-5">
      <CreateWebsiteUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditWebsiteUserModal user={editingUser} open={!!editingUser} onClose={() => setEditingUser(null)} />
      <ResetWebsitePasswordModal user={resetUser} open={!!resetUser} onClose={() => setResetUser(null)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Website Users</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {users.length} user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New User
        </button>
      </div>

      <div className="glass-card glass-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Warehouses</th>
              <th>Last Login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const role = roles.find((r) => r.id === user.role_id);
                return (
                  <tr key={user.id}>
                    <td className="cell-mono">{user.id}</td>
                    <td style={{ fontWeight: 500 }}>{user.username}</td>
                    <td className="cell-muted">{user.email}</td>
                    <td>
                      {role ? (
                        <span className="badge badge-draft">{role.name}</span>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`badge ${user.active ? "badge-active" : "badge-archived"}`}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="cell-muted" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(user.warehouses || [])
                        .map((id) => warehouses.find((w) => w.id === id)?.name)
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="cell-mono" style={{ fontSize: "0.8rem" }}>{formatDate(user.last_login)}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <button className="btn btn-warning btn-sm" onClick={() => setEditingUser(user)}>Edit</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setResetUser(user)}>Reset PW</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
