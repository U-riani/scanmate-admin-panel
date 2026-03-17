// src/pages/users/WebsiteUsers.jsx

import { useState } from "react";
import { useWebsiteUsers } from "../../queries/websiteUsersQuery";
import { useDeleteWebsiteUser } from "../../queries/websiteUsersMutation";
import { useWebsiteRoles } from "../../queries/websiteRolesQuery";

import CreateWebsiteUserModal from "../../components/users/CreateWebsiteUserModal";
import EditWebsiteUserModal from "../../components/users/EditWebsiteUserModal";
import ResetWebsitePasswordModal from "../../components/users/ResetWebsitePasswordModal";
import { useWarehouses } from "../../queries/warehouseQuery";

export default function WebsiteUsers() {
  const { data: users = [], isLoading } = useWebsiteUsers();
  const { mutate: deleteUser } = useDeleteWebsiteUser();

  const { data: roles = [] } = useWebsiteRoles();
  const { data: warehouses = [] } = useWarehouses();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);

  if (isLoading) return <div>Loading users...</div>;

  function handleDelete(user) {
    const confirmed = window.confirm(`Delete user "${user.username}"?`);

    if (!confirmed) return;

    deleteUser(user.id);
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Website Users</h1>

        <button
          onClick={() => setCreateOpen(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          + Create User
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Active</th>
              <th className="p-3">Warehouses</th>
              <th className="p-3">Last Login</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const role = roles.find((r) => r.id === user.role_id);

              return (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.id}</td>

                  <td className="p-3">{user.username}</td>

                  <td className="p-3">{user.email}</td>

                  <td className="p-3">{role?.name || "-"}</td>

                  <td className="p-3">{user.active ? "Active" : "Inactive"}</td>

                  <td className="p-3">
                    {(user.warehouses || [])
                      .map((id) => warehouses.find((w) => w.id === id)?.name)
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>
                  
                  <td className="p-3">{user.last_login || "-"}</td>

                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="px-2 py-1 text-xs bg-yellow-400 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setResetUser(user)}
                      className="px-2 py-1 text-xs bg-gray-600 text-white rounded"
                    >
                      Reset Password
                    </button>

                    <button
                      onClick={() => handleDelete(user)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateWebsiteUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditWebsiteUserModal
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
      />

      <ResetWebsitePasswordModal
        user={resetUser}
        open={!!resetUser}
        onClose={() => setResetUser(null)}
      />
    </div>
  );
}
