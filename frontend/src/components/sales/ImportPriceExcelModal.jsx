import { useState } from "react";
import { parsePriceExcel } from "../../utils/excel/priceExcelParser";
import { useAddPriceRows } from "../../queries/priceUploadMutation";

export default function ImportPriceExcelModal({ open, onClose, uploadId }) {
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState(null);
  const addRowsMutation = useAddPriceRows();

  if (!open) return null;

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const parsed = await parsePriceExcel(file);
    const mapped = parsed.map((row) => ({
      barcode: String(row["Barcode"] ?? "").trim(),
      name: row["Name"] ?? "",
      category: row["Category"] ?? "",
      color: row["Color"] ?? "",
      size: row["Size"] ?? "",
      group: row["Group"] ?? "",
      article: row["Article"] ?? "",
      base_price: Number(row["Base Price"]),
      adjusted_price: Number(row["Adjusted Price"]),
    }));
    setRows(mapped);
    setPreview(null);
  }

  function previewData() {
    const seen = new Set();
    let dup = 0, errors = 0;
    rows.forEach((r) => {
      if (!r.barcode || isNaN(r.base_price) || isNaN(r.adjusted_price)) errors++;
      if (seen.has(r.barcode)) dup++;
      seen.add(r.barcode);
    });
    setPreview({ rows: rows.length, duplicates: dup, errors });
  }

  function importRows() {
    addRowsMutation.mutate({ upload_id: uploadId, rows }, {
      onSuccess: () => { setRows([]); setPreview(null); onClose(); },
    });
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 500 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Import Excel</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="field-label">Select File</label>
            <label
              className="glass-card flex items-center gap-3 p-4 mt-1"
              style={{ cursor: "pointer", borderStyle: "dashed", borderColor: rows.length ? "rgba(0,212,255,0.3)" : "var(--glass-border)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ color: rows.length ? "var(--accent-cyan)" : "var(--text-muted)", flexShrink: 0 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span style={{ color: rows.length ? "var(--text-primary)" : "var(--text-muted)", fontSize: "0.875rem" }}>
                {rows.length ? `${rows.length} rows loaded` : "Click to select .xlsx or .xls file"}
              </span>
              <input type="file" accept=".xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </div>

          {preview && (
            <div className="glass-card p-4 grid grid-cols-3 gap-4" style={{ background: "rgba(255,255,255,0.02)" }}>
              {[
                { label: "Total Rows", value: preview.rows, color: "var(--text-primary)" },
                { label: "Duplicates", value: preview.duplicates, color: preview.duplicates > 0 ? "#fbbf24" : "var(--text-muted)" },
                { label: "Errors", value: preview.errors, color: preview.errors > 0 ? "#f87171" : "var(--text-muted)" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="section-label">{label}</p>
                  <p className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, color, marginTop: 2 }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={previewData} disabled={!rows.length} className="btn btn-secondary">
              Preview
            </button>
            <button onClick={importRows} disabled={!preview || addRowsMutation.isPending} className="btn btn-primary">
              {addRowsMutation.isPending ? "Importing…" : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
