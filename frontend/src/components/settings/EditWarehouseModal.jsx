// src/components/settings/EditWarehouseModal.jsx

import { useState, useEffect } from "react";
import { useUpdateWarehouse } from "../../queries/warehouseMutation";

export default function EditWarehouseModal({ warehouse, open, onClose }) {

  const { mutate } = useUpdateWarehouse();

  const [form, setForm] = useState({
    name: "",
    code: "",
    active: true,
  });

  useEffect(() => {
    if (warehouse) {
      setForm(warehouse);
    }
  }, [warehouse]);

  if (!open || !warehouse) return null;

  function submit(e) {
    e.preventDefault();

    mutate({
      id: warehouse.id,
      data: form,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-[420px] rounded bg-white p-6 shadow">

        <h2 className="mb-4 text-lg font-semibold">
          Edit Warehouse
        </h2>

        <form onSubmit={submit} className="space-y-3">

          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <label className="flex gap-2 items-center">
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
