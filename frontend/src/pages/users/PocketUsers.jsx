// frontend/src/pages/users/PocketUsers.jsx

import { useState } from "react";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { usePocketRoles } from "../../queries/pocketRolesQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useDeletePocketUser } from "../../queries/pocketUsersMutation";
import EditUserModal from "../../components/users/EditUserModal";
import CreatePocketUserModal from "../../components/users/CreatePocktetUserModal";
import ResetPasswordModal from "../../components/users/ResetPasswordModal";

export default function PocketUsers() {
  const { data: users = [], isLoading } = usePocketUsers();
  const { data: roles = [] } = usePocketRoles();
  const { data: warehouse = [] } = useWarehouses();
  const { mutate: deleteUser } = useDeletePocketUser();

  const [resetUser, setResetUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  function handleEdit(user) {
    setEditingUser(user);
  }

  function handleDelete(user) {
    const confirmed = window.confirm(`Delete user "${user.username}"?`);

    if (!confirmed) return;

    deleteUser(user.id);
  }
  if (isLoading) {
    return <div>Loading users...</div>;
  }
console.log(warehouse)
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Warehouse Users</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          + Create User
        </button>
      </div>
      <EditUserModal
        open={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
      />
      <ResetPasswordModal
        user={resetUser}
        open={!!resetUser}
        onClose={() => setResetUser(null)}
      />
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">User ID</th>
              <th className="p-3">Username</th>
              <th className="p-3">Role</th>
              <th className="p-3">Warehouses</th>
              <th className="p-3">Modules</th>
              <th className="p-3">Active</th>
              <th className="p-3">Last Login</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const role = roles.find((r) => r.id === user.role_id);

              return (
                <tr key={user.id} className="border-t">
                  <td className="p-3 text-center">{user.id}</td>
                  <td className="p-3 text-center">{user.username}</td>
                  <td className="p-3 text-center">{role?.name || "-"}</td>
                  <td className="p-3 text-center">
                    {user.warehouses?.join(", ") || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {Object.entries(role?.modules || {})
                      .filter(([k, v]) => v)
                      .map(([k]) => (
                        <span
                          key={k}
                          className="mr-2 px-2 py-1 text-xs bg-gray-100 rounded"
                        >
                          {k}
                        </span>
                      ))}
                  </td>
                  <td className="p-3 text-center">
                    {user.active ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3 text-center">{user.last_login || "-"}</td>
                  <td className="p-3 space-x-2 text-center">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-2 py-1 text-xs bg-yellow-400 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setResetUser(user)}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded"
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
      <CreatePocketUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
