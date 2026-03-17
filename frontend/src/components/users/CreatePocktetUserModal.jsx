// frontend/src/components/users/CreateUserModal.jsx

import { useState } from "react";
import { useCreatePocketUser } from "../../queries/pocketUsersMutation";
import { usePocketRoles } from "../../queries/pocketRolesQuery";

export default function CreatePocketUserModal({ open, onClose }) {
  const { mutate, isPending } = useCreatePocketUser();
  const { data: roles = [] } = usePocketRoles();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role_id: "",
    warehouses: [],
    active: true,
  });

  if (!open) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    mutate(form, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded shadow p-6 w-[420px]">

        <h2 className="text-lg font-semibold mb-4">
          Create Pocket User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Username */}
          <input
            name="username"
            placeholder="Username"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          {/* Initial password */}
          <input
            type="password"
            name="password"
            placeholder="Initial password"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          {/* Role selector */}
          <select
            name="role_id"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                role_id: Number(e.target.value),
              })
            }
            required
          >
            <option value="">Select role</option>

            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {/* Warehouse scope */}
          <input
            name="warehouses"
            placeholder="Warehouse IDs (comma separated)"
            className="w-full border p-2 rounded"
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

          {/* Active toggle */}
          <label className="flex gap-2 items-center pt-1">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm({
                  ...form,
                  active: e.target.checked,
                })
              }
            />
            Active
          </label>

          {/* Buttons */}
          <div className="flex gap-2 pt-3">

            <button
              type="submit"
              disabled={isPending}
              className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
            >
              {isPending ? "Creating..." : "Create"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}