import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../app/paths";
import { usePriceUploads } from "../../queries/priceUploadsQuery";
import { useArchivePriceUpload, useSetActivePriceUpload } from "../../queries/priceUploadMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useAuthStore } from "../../store/authStore";
import CreatePriceListModal from "../../components/sales/CreatePriceListModal";
import PriceLookupBox from "../../components/sales/PriceLookupBox";

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-9 w-40 rounded-lg" />
      </div>
      <div className="glass-card p-5">
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
      <div className="glass-card">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            {[40, 100, 120, 90, 50, 50, 50, 50, 70, 80].map((w, j) => (
              <div key={j} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const visibleWarehouses = warehouses.filter((w) => allowedWarehouseIds.includes(w.id));

  const filteredUploads = useMemo(() => {
    return uploads.filter((u) => {
      if (!allowedWarehouseIds.includes(u.warehouse_id)) return false;
      if (!warehouseFilter) return true;
      return u.warehouse_id === Number(warehouseFilter);
    });
  }, [uploads, allowedWarehouseIds, warehouseFilter]);

  function getWarehouseName(id) {
    return warehouses.find((w) => w.id === id)?.name ?? "—";
  }
  function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  }

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      <CreatePriceListModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Sales & Price Lists</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {filteredUploads.length} upload{filteredUploads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Price List
        </button>
      </div>

      <PriceLookupBox />

      {/* Filters */}
      <div className="glass-card p-4 flex items-center gap-3">
        <label className="field-label mb-0" style={{ whiteSpace: "nowrap" }}>Warehouse</label>
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="glass-select"
          style={{ maxWidth: 220 }}
        >
          <option value="">All allowed warehouses</option>
          {visibleWarehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card glass-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Warehouse</th>
              <th>File Name</th>
              <th>Uploaded</th>
              <th>Rows</th>
              <th>Valid</th>
              <th>Errors</th>
              <th>Dupes</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUploads.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                  No price uploads found
                </td>
              </tr>
            ) : (
              filteredUploads.map((upload) => (
                <tr key={upload.id}>
                  <td className="cell-mono">{upload.id}</td>
                  <td className="cell-muted">{getWarehouseName(upload.warehouse_id)}</td>
                  <td style={{ fontWeight: 500, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {upload.file_name}
                  </td>
                  <td className="cell-mono">{formatDate(upload.uploaded_at)}</td>
                  <td className="cell-mono">{upload.rows_count}</td>
                  <td>
                    <span style={{ color: "#34d399", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                      {upload.valid_rows_count}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: upload.error_rows_count > 0 ? "#f87171" : "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                      {upload.error_rows_count}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: upload.duplicate_count > 0 ? "#fbbf24" : "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                      {upload.duplicate_count}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${upload.status === "active" ? "badge-active" : "badge-archived"}`}>
                      {upload.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(PATHS.SALES_PRICE_LIST_DETAIL(upload.id))}
                      >
                        View
                      </button>
                      {upload.status !== "active" && (
                        <button className="btn btn-success btn-sm" onClick={() => setActiveMutation.mutate(upload.id)}>
                          Activate
                        </button>
                      )}
                      {upload.status === "active" && (
                        <button className="btn btn-warning btn-sm" onClick={() => archiveMutation.mutate(upload.id)}>
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
