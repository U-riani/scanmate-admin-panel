// frontend/src/components/users/EditUserModal.jsx

import { useState, useEffect } from "react";
import { useUpdatePocketUser } from "../../queries/pocketUsersMutation";
import { usePocketRoles } from "../../queries/pocketRolesQuery";

export default function EditUserModal({ user, open, onClose }) {

  const { mutate } = useUpdatePocketUser();
  const { data: roles = [] } = usePocketRoles();

  const [form, setForm] = useState({
    username: "",
    role_id: "",
    warehouses: [],
    active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        role_id: user.role_id || "",
        warehouses: user.warehouses || [],
        active: user.active ?? true,
      });
    }
  }, [user]);

  if (!open || !user) return null;

  function handleSubmit(e) {
    e.preventDefault();

    mutate({
      id: user.id,
      data: form
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded p-6 w-[420px]">

        <h2 className="text-lg font-semibold mb-4">
          Edit Pocket User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Username */}
          <input
            value={form.username}
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          {/* Role */}
          <select
            value={form.role_id}
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setForm({
                ...form,
                role_id: Number(e.target.value),
              })
            }
          >
            <option value="">Select role</option>

            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {/* Warehouses */}
          <input
            value={form.warehouses.join(",")}
            placeholder="Warehouses (comma separated)"
            className="border p-2 w-full rounded"
            onChange={(e) =>
              setForm({
                ...form,
                warehouses: e.target.value
                  .split(",")
                  .map((w) => Number(w.trim()))
                  .filter(Boolean),
              })
            }
          />

          {/* Active */}
          <label className="flex gap-2 items-center">

            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm({
                  ...form,
                  active: e.target.checked
                })
              }
            />

            Active

          </label>

          {/* Last Login (read only) */}
          <div className="text-sm text-gray-500">

            Last login: {user.last_login || "Never"}

          </div>

          <div className="flex gap-2 pt-3">

            <button className="bg-sky-600 text-white px-4 py-2 rounded">
              Save
            </button>

            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}