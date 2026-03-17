// src/pages/transfer/TransferDetail.jsx

import { useParams } from "react-router-dom";
import { useState } from "react";

import { useTransfers } from "../../queries/transferQuery";
import { useTransferLines } from "../../queries/transferLinesQuery";
import { useTransferStatusMutation } from "../../queries/transferStatusMutation";
import {
  useAddTransferLines,
  useUpdateTransferLine,
  useDeleteTransferLine,
} from "../../queries/transferLinesMutation";

import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";

import AddProductModal from "../../components/transfer/AddProductModal";
import WarehouseProductSelector from "../../components/transfer/WarehouseProductSelector";
import ExcelImportModal from "../../components/transfer/ExcelImportModal";

import StatusBadge from "../../components/documents/StatusBadge";

import { TRANSFER_FLOW } from "../../config/transferStatusFlow";

export default function TransferDetail() {
  const { id } = useParams();

  const { data: docs = [] } = useTransfers();
  const { data: warehouses = [] } = useWarehouses();
  const { data: users = [] } = usePocketUsers();

  const doc = docs.find((d) => String(d.id) === id);

  const { data: lines = [] } = useTransferLines(doc?.id);

  const statusMutation = useTransferStatusMutation();
  const addLinesMutation = useAddTransferLines();
  const updateLineMutation = useUpdateTransferLine();
  const deleteLineMutation = useDeleteTransferLine();

  const [addModal, setAddModal] = useState(false);
  const [excelModal, setExcelModal] = useState(false);
  const [warehouseSelector, setWarehouseSelector] = useState(false);

  if (!doc) return <div className="p-6">Not found</div>;

  function getWarehouseName(id) {
    const w = warehouses.find((w) => w.id === id);

    return w ? w.name : "-";
  }

  function getUserName(id) {
    const u = users.find((u) => u.id === id);

    return u ? u.username : "-";
  }

  function renderActions(status) {
    const allowed = TRANSFER_FLOW[status] || [];

    return allowed.map((next) => (
      <button
        key={next}
        onClick={() =>
          statusMutation.mutate({
            id: doc.id,
            status: next,
          })
        }
        className="px-3 py-1 bg-sky-600 text-white rounded text-sm"
      >
        {next.replace("_", " ")}
      </button>
    ));
  }

  function addProduct(product) {
    addLinesMutation.mutate({
      documentId: doc.id,
      products: [product],
    });
  }

  function addWarehouseProduct(product) {
    addLinesMutation.mutate({
      documentId: doc.id,
      products: [product],
    });

    setWarehouseSelector(false);
  }

  function importExcel(products) {
    addLinesMutation.mutate({
      documentId: doc.id,
      products,
    });

    setExcelModal(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transfer #{doc.id}</h1>

      {/* Action buttons */}

      <div className="flex gap-2">
        <button
          className="bg-sky-600 text-white px-3 py-1 rounded"
          onClick={() => setAddModal(true)}
        >
          Add Product
        </button>

        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => setExcelModal(true)}
        >
          Import Excel
        </button>

        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={() => setWarehouseSelector(true)}
        >
          Warehouse Products
        </button>
      </div>

      {/* Modals */}

      <AddProductModal
        open={addModal}
        onClose={() => setAddModal(false)}
        onAdd={addProduct}
      />

      {warehouseSelector && (
        <div className="bg-white p-4 rounded shadow">
          <WarehouseProductSelector
            warehouseId={doc.from_warehouse_id}
            onSelect={addWarehouseProduct}
          />
        </div>
      )}

      {excelModal && (
        <div className="bg-white p-4 rounded shadow">
          <ExcelImportModal documentId={doc.id} onImport={importExcel} />
        </div>
      )}

      {/* Document info */}

      <div className="bg-white p-6 rounded shadow space-y-3">
        <div>
          <span className="text-gray-500">Name:</span> {doc.name}
        </div>

        <div>
          <span className="text-gray-500">From:</span>{" "}
          {getWarehouseName(doc.from_warehouse_id)}
        </div>

        <div>
          <span className="text-gray-500">To:</span>{" "}
          {getWarehouseName(doc.to_warehouse_id)}
        </div>

        <div>
          <span className="text-gray-500">Status:</span>{" "}
          <StatusBadge status={doc.status} />
        </div>

        <div>
          <span className="text-gray-500">Sender:</span>{" "}
          {getUserName(doc.sender_user_id)}
        </div>

        <div>
          <span className="text-gray-500">Receiver:</span>{" "}
          {getUserName(doc.receiver_user_id)}
        </div>
      </div>

      {/* Status workflow */}

      <div className="bg-white p-6 rounded shadow">
        <div className="text-sm text-gray-500 mb-2">Available Actions</div>

        <div className="flex gap-2">{renderActions(doc.status)}</div>
      </div>

      {/* Transfer table */}

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Transfer Results</h2>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Barcode</th>
              <th className="p-3 text-left">Article</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Sent</th>
              <th className="p-3 text-left">Received</th>
              <th className="p-3 text-left">Diff</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-t">
                <td className="p-3">{line.barcode}</td>

                <td className="p-3">{line.article_code}</td>

                <td className="p-3">{line.product_name}</td>

                <td className="p-3">
                  <input
                    type="number"
                    value={line.sent_qty}
                    className="border px-2 w-20"
                    onChange={(e) =>
                      updateLineMutation.mutate({
                        lineId: line.id,
                        data: { sent_qty: Number(e.target.value) },
                      })
                    }
                  />
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    value={line.received_qty}
                    className="border px-2 w-20"
                    onChange={(e) =>
                      updateLineMutation.mutate({
                        lineId: line.id,
                        data: { received_qty: Number(e.target.value) },
                      })
                    }
                  />
                </td>

                <td
                  className={`p-3 ${
                    line.difference_qty !== 0
                      ? "text-red-600 font-semibold"
                      : ""
                  }`}
                >
                  {line.sent_qty - line.received_qty}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => deleteLineMutation.mutate(line.id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
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
