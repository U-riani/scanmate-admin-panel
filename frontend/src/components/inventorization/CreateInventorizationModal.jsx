// src/components/inventorization/CreateInventorizationModal.jsx

import { useState } from "react";
import { useCreateInventorization } from "../../queries/inventorizationMutation";
import { useWarehouseStore } from "../../store/warehouseStore";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import { mockPocketRoles } from "../../data/mockPocketRoles";

export default function CreateInventorizationModal({ open, onClose }) {
  const { mutate, isPending } = useCreateInventorization();

  const { data: users = [] } = usePocketUsers();
  const { data: warehouses = [] } = useWarehouses();

  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);

  const warehouse = warehouses.find((w) => w.id === currentWarehouseId);

  const [form, setForm] = useState({
    name: "",
    type: "barcode",
    employees: [],
    description: "",
  });

  if (!open) return null;

  // Filter employees according to rules
  const allowedEmployees = users.filter((u) => {
    const role = mockPocketRoles.find((r) => r.id === u.role_id);

    const warehouseAllowed = (u.warehouses || []).includes(currentWarehouseId);

    const moduleAllowed = role?.modules?.inventorization === true;

    const active = u.active === true;

    return warehouseAllowed && moduleAllowed && active;
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleEmployee(id) {
    if (form.employees.includes(id)) {
      setForm((prev) => ({
        ...prev,
        employees: prev.employees.filter((e) => e !== id),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        employees: [...prev.employees, id],
      }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!currentWarehouseId) {
      alert("Please select a warehouse first.");
      return;
    }

    mutate(
      {
        name: form.name,
        type: form.type,
        warehouse_id: currentWarehouseId,
        employees: form.employees,
        description: form.description,
      },
      {
        onSuccess: () => {
          onClose();

          // reset form
          setForm({
            name: "",
            type: "barcode",
            employees: [],
            description: "",
          });
        },
      },
    );
  }
  console.log("warehouse:", currentWarehouseId);
  console.log("users:", users);
  console.log("allowedEmployees:", allowedEmployees);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-[450px]">
        <h2 className="text-lg font-semibold mb-4">Create Inventorization</h2>

        <div className="text-sm text-gray-500 mb-4">
          Warehouse:{" "}
          <span className="font-medium">
            {warehouse?.name || "Not selected"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Inventorization name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={handleChange}
            required
          />

          <select
            name="type"
            className="w-full border p-2 rounded"
            value={form.type}
            onChange={handleChange}
          >
            <option value="barcode">Barcode based</option>

            <option value="box">Box based</option>
          </select>

          <div>
            <div className="text-sm font-medium mb-1">Assigned Employees</div>

            <div className="max-h-32 overflow-y-auto border rounded p-2">
              {allowedEmployees.length === 0 && (
                <div className="text-xs text-gray-400">
                  No available employees for this warehouse
                </div>
              )}

              {allowedEmployees.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.employees.includes(u.id)}
                    onChange={() => toggleEmployee(u.id)}
                  />

                  {u.username}
                </label>
              ))}
            </div>
          </div>

          <textarea
            name="description"
            placeholder="Optional description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={handleChange}
          />

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={!currentWarehouseId || isPending}
              className="bg-sky-600 text-white px-4 py-2 rounded"
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
