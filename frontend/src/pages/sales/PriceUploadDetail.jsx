// src/pages/sales/PriceUploadDetail.jsx

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { usePriceUpload, usePriceRows } from "../../queries/priceUploadsQuery";
import { useWarehouses } from "../../queries/warehouseQuery";

import { parsePriceExcel } from "../../utils/excel/priceExcelParser";
import ImportPriceExcelModal from "../../components/sales/ImportPriceExcelModal";

export default function PriceUploadDetail() {
  const { id } = useParams();

  const uploadId = Number(id);

  const { data: upload, isLoading: uploadLoading } = usePriceUpload(uploadId);
  const { data: rows = [], isLoading: rowsLoading } = usePriceRows(uploadId);
  const { data: warehouses = [] } = useWarehouses();

  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((row) => {
      return (
        String(row.barcode).toLowerCase().includes(q) ||
        String(row.name).toLowerCase().includes(q) ||
        String(row.article).toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  function getWarehouseName(id) {
    const warehouse = warehouses.find((w) => w.id === id);
    return warehouse ? warehouse.name : "-";
  }

  if (uploadLoading || rowsLoading) {
    return <div>Loading upload details...</div>;
  }

  if (!upload) {
    return <div>Upload not found</div>;
  }

  return (
    <div className="space-y-6">
      <ImportPriceExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        uploadId={uploadId}
      />
      <h1 className="text-2xl font-semibold">Price Upload #{upload.id}</h1>

      <button
        onClick={() => setImportOpen(true)}
        className="bg-sky-600 text-white px-3 py-2 rounded"
      >
        Import Excel
      </button>

      <div className="bg-white rounded shadow p-6 space-y-2">
        <div>
          <span className="text-gray-500">Warehouse:</span>{" "}
          {getWarehouseName(upload.warehouse_id)}
        </div>
        <div>
          <span className="text-gray-500">File:</span> {upload.file_name}
        </div>
        <div>
          <span className="text-gray-500">Uploaded At:</span>{" "}
          {upload.uploaded_at}
        </div>
        <div>
          <span className="text-gray-500">Rows:</span> {upload.rows_count}
        </div>
        <div>
          <span className="text-gray-500">Valid:</span>{" "}
          {upload.valid_rows_count}
        </div>
        <div>
          <span className="text-gray-500">Errors:</span>{" "}
          {upload.error_rows_count}
        </div>
        <div>
          <span className="text-gray-500">Duplicates:</span>{" "}
          {upload.duplicate_count}
        </div>
        <div>
          <span className="text-gray-500">Status:</span> {upload.status}
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by barcode, name, article"
          className="border rounded px-3 py-2 w-full"
        />

        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Barcode</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Color</th>
                <th className="p-3 text-left">Size</th>
                <th className="p-3 text-left">Group</th>
                <th className="p-3 text-left">Article</th>
                <th className="p-3 text-left">Base Price</th>
                <th className="p-3 text-left">Adjusted Price</th>
                <th className="p-3 text-left">Price Type</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.barcode}</td>
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.category}</td>
                  <td className="p-3">{row.color}</td>
                  <td className="p-3">{row.size}</td>
                  <td className="p-3">{row.group}</td>
                  <td className="p-3">{row.article}</td>
                  <td className="p-3">{row.base_price}</td>
                  <td className="p-3">{row.adjusted_price}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        row.price_type === "discounted"
                          ? "bg-red-100 text-red-700"
                          : row.price_type === "markup"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {row.price_type}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    No rows found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
