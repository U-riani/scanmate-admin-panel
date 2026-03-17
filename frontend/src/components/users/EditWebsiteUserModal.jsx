// frontend/src/components/users/EditWebsiteUserModal.jsx

import { useEffect, useState } from "react";
import { useUpdateWebsiteUser } from "../../queries/websiteUsersMutation";
import { useWebsiteRoles } from "../../queries/websiteRolesQuery";
import { useWarehouses } from "../../queries/warehouseQuery";

export default function EditWebsiteUserModal({ user, open, onClose }) {
  const { mutate, isPending } = useUpdateWebsiteUser();
  const { data: roles = [] } = useWebsiteRoles();
  const { data: warehouses = [] } = useWarehouses();

  const [form, setForm] = useState({
    username: "",
    email: "",
    role_id: 2,
    warehouses: [],
    active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        role_id: user.role_id || 2,
        warehouses: user.warehouses || [],
        active: user.active ?? true,
      });
    }
  }, [user]);

  if (!open || !user) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    mutate(
      {
        id: user.id,
        data: form,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Edit Website User</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full rounded border p-2"
            required
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded border p-2"
            required
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Warehouses</label>

            {warehouses.map((w) => (
              <label key={w.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.warehouses?.includes(w.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({
                        ...form,
                        warehouses: [...(form.warehouses || []), w.id],
                      });
                    } else {
                      setForm({
                        ...form,
                        warehouses: (form.warehouses || []).filter(
                          (id) => id !== w.id,
                        ),
                      });
                    }
                  }}
                />

                {w.name}
              </label>
            ))}
          </div>
          <select
            name="role_id"
            value={form.role_id}
            onChange={handleChange}
            className="w-full rounded border p-2"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
            />
            Active
          </label>

          <div className="text-sm text-gray-500">
            Last login: {user.last_login || "Never"}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
