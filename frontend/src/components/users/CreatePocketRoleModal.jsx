// frontend/src/components/users/CreatePocketRoleModal.jsx

import { useState } from "react";
import { useCreatePocketRole } from "../../queries/pocketRolesMutation";

export default function CreatePocketRoleModal({ open, onClose }) {
  const { mutate, isPending } = useCreatePocketRole();

  const [form, setForm] = useState({
    name: "",
    description: "",
    modules: {
      inventorization: false,
      transfer: false,
      receive: false,
      sales: false,
    },
  });

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();

    mutate(form, {
      onSuccess: () => {
        setForm({
          name: "",
          description: "",
          modules: {
            inventorization: false,
            transfer: false,
            receive: false,
            sales: false,
          },
        });
        onClose();
      },
    });
  }

  function toggleModule(moduleName) {
    setForm((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleName]: !prev.modules[moduleName],
      },
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[460px] rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Create Pocket Role</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Role name"
            className="w-full rounded border p-2"
            required
          />

          <input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Role description"
            className="w-full rounded border p-2"
            required
          />

          <div className="rounded border p-3">
            <div className="mb-2 font-medium">Module Permissions</div>

            <div className="space-y-2">
              {["inventorization", "transfer", "receive", "sales"].map(
                (module) => (
                  <label key={module} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.modules[module]}
                      onChange={() => toggleModule(module)}
                    />
                    <span className="capitalize">{module}</span>
                  </label>
                )
              )}
            </div>
          </div>

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