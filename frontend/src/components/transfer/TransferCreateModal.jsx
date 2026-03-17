// src/components/transfer/CreateTransferModal.jsx

import { useState } from "react";
import { useCreateTransfer } from "../../queries/transferCreateMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouseStore } from "../../store/warehouseStore";

export default function CreateTransferModal({ open, onClose }) {

  const { data: warehouses = [] } = useWarehouses();
  const { data: users = [] } = usePocketUsers();

  const currentWarehouseId =
    useWarehouseStore((s) => s.currentWarehouseId);

  const createMutation = useCreateTransfer();

  const [form, setForm] = useState({
    name: "",
    number: "",
    from_warehouse_id: currentWarehouseId,
    to_warehouse_id: "",
    type: "barcode",
    sender_user_id: "",
    receiver_user_id: ""
  });

  if (!open) return null;

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    createMutation.mutate(form, {
      onSuccess: () => {

        setForm({
          name: "",
          number: "",
          from_warehouse_id: currentWarehouseId,
          to_warehouse_id: "",
          type: "barcode",
          sender_user_id: "",
          receiver_user_id: ""
        });

        onClose();
      }
    });
  }

  const otherWarehouses =
    warehouses.filter(w => w.id !== currentWarehouseId);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded shadow w-[500px] p-6 space-y-4">

        <h2 className="text-xl font-semibold">
          Create Transfer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Name */}

          <div>
            <label className="text-sm text-gray-600">
              Transfer Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Number */}

          <div>
            <label className="text-sm text-gray-600">
              Transfer Number
            </label>

            <input
              value={form.number}
              onChange={(e) =>
                updateField("number", e.target.value)
              }
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* From warehouse */}

          <div>
            <label className="text-sm text-gray-600">
              From Warehouse
            </label>

            <select
              value={form.from_warehouse_id}
              disabled
              className="w-full border rounded px-3 py-2"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* To warehouse */}

          <div>
            <label className="text-sm text-gray-600">
              To Warehouse
            </label>

            <select
              value={form.to_warehouse_id}
              onChange={(e) =>
                updateField(
                  "to_warehouse_id",
                  Number(e.target.value)
                )
              }
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select warehouse</option>

              {otherWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Type */}

          <div>
            <label className="text-sm text-gray-600">
              Transfer Type
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                updateField("type", e.target.value)
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="barcode">
                Barcode
              </option>

              <option value="box">
                Box
              </option>

            </select>
          </div>

          {/* Sender */}

          <div>
            <label className="text-sm text-gray-600">
              Sender User
            </label>

            <select
              value={form.sender_user_id}
              onChange={(e) =>
                updateField(
                  "sender_user_id",
                  Number(e.target.value)
                )
              }
              required
              className="w-full border rounded px-3 py-2"
            >

              <option value="">Select sender</option>

              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}

            </select>
          </div>

          {/* Receiver */}

          <div>
            <label className="text-sm text-gray-600">
              Receiver User
            </label>

            <select
              value={form.receiver_user_id}
              onChange={(e) =>
                updateField(
                  "receiver_user_id",
                  Number(e.target.value)
                )
              }
              required
              className="w-full border rounded px-3 py-2"
            >

              <option value="">Select receiver</option>

              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}

            </select>
          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-1 bg-sky-600 text-white rounded"
            >
              Create
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}