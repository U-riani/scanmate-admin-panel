import * as XLSX from "xlsx";

export default function ExcelImportModal({ documentId, onImport }) {
  function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);

      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      onImport(rows); // send FULL rows to backend
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="space-y-3">
      <p className="section-label">Import from Excel</p>
      <label
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{
          cursor: "pointer",
          border: "1px dashed var(--glass-border)",
          background: "rgba(255,255,255,0.02)",
          transition: "border-color 0.2s",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Click to select .xlsx file
        </span>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}
