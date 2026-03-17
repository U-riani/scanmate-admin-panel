// frontend/src/pages/users/PocketRoles.jsx

import { useState } from "react";
import { usePocketRoles } from "../../queries/pocketRolesQuery";
import {
  useUpdatePocketRole,
  useDeletePocketRole,
} from "../../queries/pocketRolesMutation";
import CreatePocketRoleModal from "../../components/users/CreatePocketRoleModal";

export default function PocketRoles() {
  const { data: roles = [], isLoading } = usePocketRoles();
  const { mutate: updateRole } = useUpdatePocketRole();
  const { mutate: deleteRole } = useDeletePocketRole();

  const [openCreateModal, setOpenCreateModal] = useState(false);

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  function togglePermission(role, moduleName) {
    const updatedModules = {
      ...role.modules,
      [moduleName]: !role.modules[moduleName],
    };

    updateRole({
      roleId: role.id,
      modules: updatedModules,
    });
  }

  function handleDelete(role) {
    const confirmed = window.confirm(
      `Delete role "${role.name}"?`
    );

    if (!confirmed) return;

    deleteRole(role.id);
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-semibold">Pocket Roles</h1>

        <button
          onClick={() => setOpenCreateModal(true)}
          className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
        >
          + Create Role
        </button>
      </div>

      <div className="overflow-hidden rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-center">Inventorization</th>
              <th className="p-3 text-center">Transfer</th>
              <th className="p-3 text-center">Receive</th>
              <th className="p-3 text-center">Sales</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-t">
                <td className="p-3 font-medium">{role.name}</td>

                <td className="p-3">{role.description}</td>

                {["inventorization", "transfer", "receive", "sales"].map(
                  (module) => (
                    <td key={module} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={role.modules[module]}
                        onChange={() => togglePermission(role, module)}
                      />
                    </td>
                  )
                )}

                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(role)}
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreatePocketRoleModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />
    </div>
  );
}