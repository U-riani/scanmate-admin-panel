// frontend/src/components/users/CreateWebsiteUserModal.jsx

import { useState } from "react";
import { useCreateWebsiteUser } from "../../queries/websiteUsersMutation";
import { useWebsiteRoles } from "../../queries/websiteRolesQuery";
import { useWarehouses } from "../../queries/warehouseQuery";

export default function CreateWebsiteUserModal({ open, onClose }) {
  const { mutate, isPending } = useCreateWebsiteUser();
  const { data: roles = [] } = useWebsiteRoles();
  const { data: warehouses = [] } = useWarehouses();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "2",
    warehouses: [],
    active: true,
  });

  if (!open) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    mutate(form, {
      onSuccess: () => {
        setForm({
          username: "",
          email: "",
          password: "",
          role_id: "2",
          active: true,
        });
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Create Website User</h2>

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

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Initial password"
            className="w-full rounded border p-2"
            required
          />

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
          <div className="space-y-1">
            <label className="text-sm font-medium">Warehouses</label>

            {warehouses.map((w) => (
              <label key={w.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.warehouses.includes(w.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({
                        ...form,
                        warehouses: [...form.warehouses, w.id],
                      });
                    } else {
                      setForm({
                        ...form,
                        warehouses: form.warehouses.filter((id) => id !== w.id),
                      });
                    }
                  }}
                />

                {w.name}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
            />
            Active
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {isPending ? "Creating..." : "Create"}
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
