// src/pages/users/WebsiteRoles.jsx

import { useState } from "react";
import { useWebsiteRoles } from "../../queries/websiteRolesQuery";
import {
  useUpdateWebsiteRole,
  useDeleteWebsiteRole,
} from "../../queries/websiteRolesMutation";
import { usePermission } from "../../hooks/usePermission";

import { MODULES  } from "../../config/modules";
import CreateWebsiteRoleModal from "../../components/users/CreateWebsiteRoleModal";

export default function WebsiteRoles() {
  const { data: roles = [], isLoading } = useWebsiteRoles();

  const { mutate: updateRole } = useUpdateWebsiteRole();
  const { mutate: deleteRole } = useDeleteWebsiteRole();

  const canEditRoles = usePermission("website_roles");

  const [createOpen, setCreateOpen] = useState(false);



  if (isLoading) return <div>Loading roles...</div>;

  function toggle(role, module) {
    const updatedModules = {
      ...role.modules,
      [module]: !role.modules[module],
    };

    updateRole({
      roleId: role.id,
      data: { modules: updatedModules },
    });
  }

  function handleDelete(role) {
    const confirmed = window.confirm(`Delete role "${role.name}"?`);

    if (!confirmed) return;

    deleteRole(role.id);
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Website Roles</h1>

        {canEditRoles && (
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-sky-600 text-white px-4 py-2 rounded"
          >
            + Create Role
          </button>
        )}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Role</th>

              {MODULES.map((m) => (
                <th key={m} className="p-3 text-center">
                  {m}
                </th>
              ))}

              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-t">
                <td className="p-3 font-medium">{role.name}</td>

                {MODULES.map((module) => (
                  <td key={module} className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={role.modules[module]}
                      onChange={() => toggle(role, module)}
                    />
                  </td>
                ))}

                <td className="p-3 text-center">
                  {canEditRoles && (
                    <button
                      onClick={() => handleDelete(role)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateWebsiteRoleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
