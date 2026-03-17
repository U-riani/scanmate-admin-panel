// src/pages/settings/Warehouses.jsx

import { useState } from "react";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useDeleteWarehouse } from "../../queries/warehouseMutation";

import CreateWarehouseModal from "../../components/settings/CreateWarehouseModal";
import EditWarehouseModal from "../../components/settings/EditWarehouseModal";

export default function Warehouses() {
  const { data: warehouses = [], isLoading } = useWarehouses();
  const { mutate: deleteWarehouse } = useDeleteWarehouse();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editing, setEditing] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) return <div>Loading warehouses...</div>;

  function handleDelete(w) {
    const confirmed = window.confirm(`Delete warehouse "${w.name}"?`);

    if (!confirmed) return;

    deleteWarehouse(w.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Warehouses</h1>{" "}
      <CreateWarehouseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditWarehouseModal
        warehouse={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
      />
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Warehouses</h1>

        <button
          onClick={() => setCreateOpen(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          + Create Warehouse
        </button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Code</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-3">{w.id}</td>
                <td className="p-3">{w.name}</td>
                <td className="p-3">{w.code}</td>
                <td className="p-3">{w.active ? "Yes" : "No"}</td>

                <td className="p-3">
                  <button
                    onClick={() => handleDelete(w)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>{" "}
                  <button
                    onClick={() => setEditing(w)}
                    className="px-2 py-1 text-xs bg-yellow-400 rounded mr-2"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
