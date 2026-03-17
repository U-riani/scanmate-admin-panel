// src/pages/transfer/TransferList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransfers } from "../../queries/transferQuery";
import { PATHS } from "../../app/paths";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouseStore } from "../../store/warehouseStore";

import CreateTransferModal from "../../components/transfer/TransferCreateModal";
import StatusBadge from "../../components/documents/StatusBadge";

export default function TransferList() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: docs = [], isLoading } = useTransfers();
  const { data: warehouses = [] } = useWarehouses();
  const { data: users = [] } = usePocketUsers();

  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);

  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  const filtered = docs.filter(
    (d) =>
      d.from_warehouse_id === currentWarehouseId ||
      d.to_warehouse_id === currentWarehouseId,
  );

  function getWarehouseName(id) {
    const w = warehouses.find((w) => w.id === id);

    return w ? w.name : "-";
  }

  function getUserName(id) {
    const u = users.find((u) => u.id === id);

    return u ? u.username : "-";
  }

  return (
    <div>
      <CreateTransferModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Transfers</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          + Create Transfer
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Sender</th>
              <th className="p-3 text-left">Receiver</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-3">{doc.id}</td>

                <td className="p-3 font-medium">{doc.name}</td>

                <td className="p-3">
                  {getWarehouseName(doc.from_warehouse_id)}
                </td>

                <td className="p-3">{getWarehouseName(doc.to_warehouse_id)}</td>

                <td className="p-3">{doc.type}</td>

                <td className="p-3">
                  <StatusBadge status={doc.status} />
                </td>

                <td className="p-3">{getUserName(doc.sender_user_id)}</td>

                <td className="p-3">{getUserName(doc.receiver_user_id)}</td>

                <td className="p-3">{doc.created_at}</td>

                <td className="p-3">
                  <button
                    className="bg-sky-200 px-2 rounded"
                    onClick={() => navigate(PATHS.TRANSFER_DETAIL(doc.id))}
                  >
                    see
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
