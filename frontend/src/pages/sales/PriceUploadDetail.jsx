import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { usePriceUpload, usePriceRows } from "../../queries/priceUploadsQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import ImportPriceExcelModal from "../../components/sales/ImportPriceExcelModal";
import { downloadTemplate, TEMPLATES } from "../../utils/excel/downloadTemplate";

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-8 w-64 rounded-lg" />
      <div className="glass-card p-5 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
    return rows.filter((row) =>
      String(row.barcode).toLowerCase().includes(q) ||
      String(row.name).toLowerCase().includes(q) ||
      String(row.article).toLowerCase().includes(q),
    );
  }, [rows, search]);

  function getWarehouseName(wid) {
    return warehouses.find((w) => w.id === wid)?.name ?? "—";
  }
  function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  if (uploadLoading || rowsLoading) return <LoadingSkeleton />;
  if (!upload) return (
    <div className="glass-card p-8 text-center" style={{ color: "var(--text-secondary)" }}>
      Upload not found
    </div>
  );

  return (
    <div className="space-y-5">
      <ImportPriceExcelModal open={importOpen} onClose={() => setImportOpen(false)} uploadId={uploadId} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            Price Upload{" "}
            <span className="font-mono" style={{ color: "var(--accent-cyan)", fontSize: "1.1rem" }}>
              #{upload.id}
            </span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            {upload.file_name}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => downloadTemplate(TEMPLATES.priceRows.headers, TEMPLATES.priceRows.filename)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Download Template
        </button>
        <button className="btn btn-secondary" onClick={() => setImportOpen(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Excel
        </button>
      </div>

      {/* Info + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <p className="section-label mb-3">Upload Details</p>
          <div>
            <div className="info-row"><span className="info-label">Warehouse</span><span className="info-value">{getWarehouseName(upload.warehouse_id)}</span></div>
            <div className="info-row"><span className="info-label">Status</span><span className="info-value"><span className={`badge ${upload.status === "active" ? "badge-active" : "badge-archived"}`}>{upload.status}</span></span></div>
            <div className="info-row"><span className="info-label">Uploaded At</span><span className="info-value cell-mono" style={{ fontSize: "0.82rem" }}>{formatDate(upload.uploaded_at)}</span></div>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="section-label mb-3">Row Statistics</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Rows", value: upload.rows_count, color: "var(--text-primary)" },
              { label: "Valid", value: upload.valid_rows_count, color: "#34d399" },
              { label: "Errors", value: upload.error_rows_count, color: upload.error_rows_count > 0 ? "#f87171" : "var(--text-muted)" },
              { label: "Duplicates", value: upload.duplicate_count, color: upload.duplicate_count > 0 ? "#fbbf24" : "var(--text-muted)" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="section-label">{label}</p>
                <p className="font-mono" style={{ fontSize: "1.375rem", fontWeight: 700, color, marginTop: "2px" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="glass-card p-5 space-y-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by barcode, name or article…"
            className="glass-input"
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>

        <div className="glass-table-wrapper">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Name</th>
                <th>Category</th>
                <th>Color</th>
                <th>Size</th>
                <th>Group</th>
                <th>Article</th>
                <th>Base Price</th>
                <th>Adj. Price</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                    {search ? "No rows match your search" : "No rows in this upload"}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="cell-mono">{row.barcode}</td>
                    <td style={{ fontWeight: 500 }}>{row.name}</td>
                    <td className="cell-muted">{row.category}</td>
                    <td className="cell-muted">{row.color}</td>
                    <td className="cell-mono">{row.size}</td>
                    <td className="cell-muted">{row.group_name ?? row.group}</td>
                    <td className="cell-mono">{row.article}</td>
                    <td className="cell-mono">{row.base_price?.toFixed(2)}</td>
                    <td className="cell-mono">{row.adjusted_price?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        row.price_type === "discounted" ? "badge-discount"
                        : row.price_type === "markup" ? "badge-markup"
                        : "badge-draft"
                      }`}>
                        {row.price_type || "standard"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredRows.length > 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Showing {filteredRows.length} of {rows.length} rows
          </p>
        )}
      </div>
    </div>
  );
}
