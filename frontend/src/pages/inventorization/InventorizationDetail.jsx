// src/pages/inventorization/InventorizationDetail.jsx

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { useInventorizations } from "../../queries/inventorizationQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useInventorizationLines } from "../../queries/inventorizationLinesQuery";
import { useInventorizationStatusMutation } from "../../queries/inventorizationStatusMutation";
import { useCreateRecount } from "../../queries/inventorizationRecountMutation";

import { preloadLinesFromWarehouse } from "../../api/inventorizationLinesService";

import StatusBadge from "../../components/documents/StatusBadge";
import ImportInventorizationExcelModal from "../../components/inventorization/ImportInventorizationExcelModal";

import { INVENTORIZATION_FLOW } from "../../config/inventorizationStatusFlow";

export default function InventorizationDetail() {
  const { id } = useParams();

  const [selectedLines, setSelectedLines] = useState([]);
  const [importOpen, setImportOpen] = useState(false);

  const { data: docs = [] } = useInventorizations();
  const { data: warehouses = [] } = useWarehouses();
  const { data: pocketUsers = [] } = usePocketUsers();

  const recountMutation = useCreateRecount();

  const doc = docs.find((d) => String(d.id) === id);

  const { data: lines = [] } = useInventorizationLines(doc?.id);

  const totalLines = lines.length;

  const countedLines = lines.filter((l) => l.counted_qty !== null).length;

  const progress =
    totalLines === 0 ? 0 : Math.round((countedLines / totalLines) * 100);

  const statusMutation = useInventorizationStatusMutation();

  if (!doc) {
    return <div className="p-6">Document not found</div>;
  }

  const warehouse = warehouses.find((w) => w.id === doc.warehouse_id);

  const employees = doc.employees
    .map((id) => pocketUsers.find((u) => u.id === id))
    .filter(Boolean);

  function renderActions(status) {
    const allowed = INVENTORIZATION_FLOW[status] || [];

    return allowed.map((nextStatus) => (
      <button
        key={nextStatus}
        onClick={async () => {
          if (nextStatus === "in_progress") {
            await preloadLinesFromWarehouse(doc.id, doc.warehouse_id);
          }

          statusMutation.mutate({
            id: doc.id,
            status: nextStatus,
          });
        }}
        className="px-3 py-1 bg-sky-600 text-white rounded text-sm"
      >
        {nextStatus.replace("_", " ")}
      </button>
    ));
  }

  function toggleRecount(lineId) {
    setSelectedLines((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId],
    );
  }

  function createRecount() {
    const recountItems = lines.filter((l) => selectedLines.includes(l.id));

    recountMutation.mutate({
      parent_document_id: doc.id,

      warehouse_id: doc.warehouse_id,

      employees: doc.employees,

      items: recountItems,
    });

    setSelectedLines([]);
  }

  return (
    <div className="space-y-6">
      <ImportInventorizationExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        documentId={doc.id}
      />
      <h1 className="text-2xl font-semibold">Inventorization #{doc.id}</h1>{" "}
      <button
        onClick={() => setImportOpen(true)}
        className="bg-gray-700 text-white px-4 py-2 rounded text-sm"
      >
        Import Excel
      </button>
      <div className="bg-white p-6 rounded shadow space-y-3">
        <div>
          <span className="text-gray-500">Name:</span> {doc.name}
        </div>

        <div>
          <span className="text-gray-500">Warehouse:</span> {warehouse?.name}
        </div>

        <div>
          <span className="text-gray-500">Type:</span> {doc.type}
        </div>

        <div>
          <span className="text-gray-500">Status:</span>{" "}
          <StatusBadge status={doc.status} />
        </div>

        <div>
          <span className="text-gray-500">Employees:</span>{" "}
          {employees.map((e) => e.username).join(", ")}
        </div>

        <div>
          <span className="text-gray-500">Created:</span> {doc.created_at}
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <div className="text-sm text-gray-500 mb-2">Available Actions</div>

        <div className="flex gap-2">{renderActions(doc.status)}</div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded">
          <div
            className="bg-sky-600 h-3 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Inventorization Results</h2>

          {selectedLines.length > 0 && (
            <button
              onClick={createRecount}
              className="bg-orange-600 text-white px-4 py-2 rounded text-sm"
            >
              Create Recount ({selectedLines.length})
            </button>
          )}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Recount</th>
              <th className="p-3 text-left">Barcode</th>
              <th className="p-3 text-left">Aricle</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Expected</th>
              <th className="p-3 text-left">Counted</th>
              <th className="p-3 text-left">Diff</th>
            </tr>
          </thead>

          <tbody>
            {lines.map((line) => {
              const diff =
                line.counted_qty === null
                  ? "-"
                  : line.counted_qty - line.expected_qty;
              {
                console.log(line);
              }
              return (
                <tr key={line.id} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedLines.includes(line.id)}
                      onChange={() => toggleRecount(line.id)}
                    />
                  </td>

                  <td className="p-3">{line.barcode}</td>

                  <td className="p-3">{line.article_code}</td>

                  <td className="p-3">{line.product_name}</td>

                  <td className="p-3">{line.expected_qty}</td>

                  <td className="p-3">{line.counted_qty ?? "-"}</td>

                  <td
                    className={`p-3 ${
                      diff !== 0 ? "text-red-600 font-semibold" : ""
                    }`}
                  >
                    {diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
