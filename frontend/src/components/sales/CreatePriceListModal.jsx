// src/components/sales/CreatePriceListModal.jsx

import { useState } from "react";
import { useCreatePriceUpload } from "../../queries/priceUploadMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../app/paths";

export default function CreatePriceListModal({ open, onClose }) {
  const { data: warehouses = [] } = useWarehouses();
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreatePriceUpload();
  const navigate = useNavigate();

  const [warehouseId, setWarehouseId] = useState("");
  const [name, setName] = useState("");

  if (!open) return null;

  const allowedWarehouses = warehouses.filter((w) =>
    (user?.warehouses || []).includes(w.id)
  );

  function handleCreate() {
    createMutation.mutate(
      {
        warehouse_id: Number(warehouseId),
        file_name: name || "manual_price_list",
        uploaded_by: user?.id || 1,
        rows: [],
      },
      {
        onSuccess: (data) => {
          onClose();
          navigate(PATHS.SALES_PRICE_LIST_DETAIL(data.id));
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-[450px] space-y-4">
        <h2 className="text-xl font-semibold">Create Price List</h2>

        <div>
          <label className="text-sm text-gray-600">Warehouse</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select warehouse</option>
            {allowedWarehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <input
          placeholder="Price list name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-3 py-2 rounded">
            Cancel
          </button>

          <button
            disabled={!warehouseId}
            onClick={handleCreate}
            className="bg-sky-600 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}