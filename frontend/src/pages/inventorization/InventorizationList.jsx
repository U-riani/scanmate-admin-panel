// src/pages/inventorization/InventorizationList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateInventorizationModal from "../../components/inventorization/CreateInventorizationModal";
import { useInventorizations } from "../../queries/inventorizationQuery";
import { useWarehouseStore } from "../../store/warehouseStore";
import { useWarehouses } from "../../queries/warehouseQuery";
import { PATHS } from "../../app/paths";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import StatusBadge from "../../components/documents/StatusBadge";

export default function InventorizationList() {
  const { data: docs = [], isLoading } = useInventorizations();
  const { data: warehouses = [] } = useWarehouses();
  const { data: pocketUsers = [] } = usePocketUsers();

  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);

  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);

  if (isLoading) return <div>Loading...</div>;

  const filtered = docs.filter((d) => d.warehouse_id === currentWarehouseId);

  function getWarehouseName(id) {
    const w = warehouses.find((w) => w.id === id);
    return w ? w.name : "-";
  }

  function getEmployeeNames(employeeIds) {
    if (!employeeIds?.length) return "-";

    return employeeIds
      .map((id) => {
        const user = pocketUsers.find((u) => u.id === id);
        return user ? user.username : id;
      })
      .join(", ");
  }
  return (
    <div>
      <CreateInventorizationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Inventorization</h1>

        <button
          onClick={() => setCreateOpen(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          + Create Inventorization
        </button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Warehouse</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Employees</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Updated</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-3">{doc.id}</td>

                <td className="p-3 font-medium">{doc.name}</td>

                <td className="p-3">{getWarehouseName(doc.warehouse_id)}</td>

                <td className="p-3">{doc.type}</td>

                <td className="p-3">
                  <StatusBadge status={doc.status} />
                </td>

                <td className="p-3">{getEmployeeNames(doc.employees)}</td>

                <td className="p-3">{doc.created_at}</td>

                <td className="p-3">{doc.updated_at}</td>
                <td className="p-3"><button className="bg-sky-200 px-2 rounded" onClick={() => navigate(PATHS.INVENTORIZATION_DETAIL(doc.id))}>see</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
