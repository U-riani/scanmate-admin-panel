// src/pages/sales/PriceLists.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../app/paths";
import { usePriceUploads } from "../../queries/priceUploadsQuery";
import {
  useArchivePriceUpload,
  useSetActivePriceUpload,
} from "../../queries/priceUploadMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useAuthStore } from "../../store/authStore";

import  CreatePriceListModal  from "../../components/sales/CreatePriceListModal";
import PriceLookupBox from "../../components/sales/PriceLookupBox";

export default function PriceLists() {
  const navigate = useNavigate();
  const { data: uploads = [], isLoading } = usePriceUploads();
  const { data: warehouses = [] } = useWarehouses();
  const user = useAuthStore((s) => s.user);

  const setActiveMutation = useSetActivePriceUpload();
  const archiveMutation = useArchivePriceUpload();

  const [createOpen, setCreateOpen] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState("");

  const allowedWarehouseIds = user?.warehouses || [];

  const visibleWarehouses = warehouses.filter((w) =>
    allowedWarehouseIds.includes(w.id),
  );

  const filteredUploads = useMemo(() => {
    return uploads.filter((u) => {
      const withinScope = allowedWarehouseIds.includes(u.warehouse_id);
      if (!withinScope) return false;

      if (!warehouseFilter) return true;

      return u.warehouse_id === Number(warehouseFilter);
    });
  }, [uploads, allowedWarehouseIds, warehouseFilter]);

  function getWarehouseName(id) {
    const warehouse = warehouses.find((w) => w.id === id);
    return warehouse ? warehouse.name : "-";
  }

  if (isLoading) {
    return <div>Loading price uploads...</div>;
  }

  return (
    <div className="space-y-6">
      <CreatePriceListModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Sales & Price Lists</h1>

        <button
          onClick={() => setCreateOpen(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          + Create Price List
        </button>
      </div>

      <PriceLookupBox />

      <div className="bg-white rounded shadow p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-600">Warehouse</label>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All allowed warehouses</option>
            {visibleWarehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Warehouse</th>
                <th className="p-3 text-left">File</th>
                <th className="p-3 text-left">Uploaded At</th>
                <th className="p-3 text-left">Rows</th>
                <th className="p-3 text-left">Valid</th>
                <th className="p-3 text-left">Errors</th>
                <th className="p-3 text-left">Duplicates</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUploads.map((upload) => (
                <tr key={upload.id} className="border-t">
                  <td className="p-3">{upload.id}</td>
                  <td className="p-3">
                    {getWarehouseName(upload.warehouse_id)}
                  </td>
                  <td className="p-3">{upload.file_name}</td>
                  <td className="p-3">{upload.uploaded_at}</td>
                  <td className="p-3">{upload.rows_count}</td>
                  <td className="p-3">{upload.valid_rows_count}</td>
                  <td className="p-3">{upload.error_rows_count}</td>
                  <td className="p-3">{upload.duplicate_count}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        upload.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {upload.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() =>
                        navigate(PATHS.SALES_PRICE_LIST_DETAIL(upload.id))
                      }
                      className="px-2 py-1 text-xs bg-sky-200 rounded"
                    >
                      View
                    </button>

                    {upload.status !== "active" && (
                      <button
                        onClick={() => setActiveMutation.mutate(upload.id)}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                      >
                        Set Active
                      </button>
                    )}

                    {upload.status === "active" && (
                      <button
                        onClick={() => archiveMutation.mutate(upload.id)}
                        className="px-2 py-1 text-xs bg-gray-700 text-white rounded"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUploads.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    No uploads found
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
