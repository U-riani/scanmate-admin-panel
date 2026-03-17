// src/components/settings/CreateWarehouseModal.jsx

import { useState } from "react";
import { useCreateWarehouse } from "../../queries/warehouseMutation";

export default function CreateWarehouseModal({ open, onClose }) {

  const { mutate, isPending } = useCreateWarehouse();

  const [form, setForm] = useState({
    name: "",
    code: "",
    active: true,
  });

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();

    mutate(form, {
      onSuccess: () => {
        setForm({
          name: "",
          code: "",
          active: true,
        });
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-[420px] rounded bg-white p-6 shadow">

        <h2 className="mb-4 text-lg font-semibold">
          Create Warehouse
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            placeholder="Warehouse name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />

          <input
            placeholder="Warehouse code"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm({ ...form, active: e.target.checked })
              }
            />
            Active
          </label>

          <div className="flex gap-2 pt-2">

            <button
              type="submit"
              disabled={isPending}
              className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 disabled:opacity-60"
            >
              {isPending ? "Creating..." : "Create"}
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