// frontend\src\components\receive\ImportReceiveExcelModal.jsx
import { useState } from "react";
import { parseExcel } from "../../utils/excel/excelParser";
import { useImportReceiveLines } from "../../queries/receiveMutation";

export default function ImportReceiveExcelModal({ open, onClose, documentId }) {
  const importMutation = useImportReceiveLines();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  if (!open) return null;

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const parsed = await parseExcel(file);

    const mapped = parsed.map((row) => ({
      barcode: String(row["Barcode"]),

      article_code: row["ArticCode"] || null,
      product_name: row["Name"] || null,

      color: row["Color"] || null,
      size: row["Size"] || null,

      price: Number(row["Price"] || 0),

      expected_qty: Number(row["Initial_Quantity"] || 0),
      counted_qty: Number(row["Scanned_Quantity"] || 0),

      box_id: row["Box_Id"] || null,
    }));

    setRows(mapped);
    setSummary({ rows: mapped.length });
  }

  function handleImport() {
    importMutation.mutate(
      { documentId, rows },
      {
        onSuccess: () => {
          setRows([]);
          setSummary(null);
          onClose();
        },
      },
    );
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 480 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Import Receive Items</h2>
          <button className="glass-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="field-label">Select File</label>
            <label
              className="glass-card flex items-center gap-3 p-4 mt-1"
              style={{
                cursor: "pointer",
                borderStyle: "dashed",
                borderColor: rows.length
                  ? "rgba(0,212,255,0.3)"
                  : "var(--glass-border)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{
                  color: rows.length
                    ? "var(--accent-cyan)"
                    : "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span
                style={{
                  color: rows.length
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                  fontSize: "0.875rem",
                }}
              >
                {rows.length
                  ? `${rows.length} rows loaded`
                  : "Click to select .xlsx or .xls file"}
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {summary && (
            <div
              className="glass-card p-4"
              style={{
                background: "rgba(0,212,255,0.04)",
                borderColor: "rgba(0,212,255,0.2)",
              }}
            >
              <p className="section-label">Preview</p>
              <p
                className="font-mono"
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--accent-cyan)",
                  marginTop: 4,
                }}
              >
                {summary.rows}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                rows detected
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              disabled={!rows.length || importMutation.isPending}
              onClick={handleImport}
              className="btn btn-primary"
            >
              {importMutation.isPending ? "Importing…" : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
