// frontend/src/components/users/CreateWebsiteRoleModal.jsx

import { useState } from "react";
import { useCreateWebsiteRole } from "../../queries/websiteRolesMutation";

const modulesList = [
  "dashboard",
  "website_users",
  "website_roles",
  "pocket_users",
  "pocket_roles",
  "warehouses",
  "settings",
  "reports",
];

export default function CreateWebsiteRoleModal({ open, onClose }) {
  const { mutate, isPending } = useCreateWebsiteRole();

  const [form, setForm] = useState({
    name: "",
    description: "",
    modules: modulesList.reduce((acc, m) => {
      acc[m] = false;
      return acc;
    }, {}),
    warehouses: [],
  });

  if (!open) return null;

  function toggleModule(module) {
    setForm((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: !prev.modules[module],
      },
    }));
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded p-6 shadow">

        <h2 className="text-lg font-semibold mb-4">
          Create Website Role
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            placeholder="Role name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <div className="border rounded p-3">
            <div className="font-medium mb-2">
              Modules
            </div>

            {modulesList.map((module) => (
              <label key={module} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.modules[module]}
                  onChange={() => toggleModule(module)}
                />
                {module}
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-sky-600 text-white px-4 py-2 rounded"
            >
              Create
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