// src/components/sales/ImportPriceExcelModal.jsx

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
  }

  function previewData() {
    const seen = new Set();
    let dup = 0;
    let errors = 0;

    rows.forEach((r) => {
      if (!r.barcode || isNaN(r.base_price) || isNaN(r.adjusted_price)) {
        errors++;
      }

      if (seen.has(r.barcode)) dup++;

      seen.add(r.barcode);
    });

    setPreview({
      rows: rows.length,
      duplicates: dup,
      errors,
    });
  }

  function importRows() {
    addRowsMutation.mutate(
      {
        upload_id: uploadId,
        rows,
      },
      {
        onSuccess: () => {
          setRows([]);
          setPreview(null);
          onClose();
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-[520px] space-y-4">
        <h2 className="text-xl font-semibold">Import Excel</h2>

        <input type="file" accept=".xlsx,.xls" onChange={handleFile} />

        {preview && (
          <div className="bg-gray-100 p-3 rounded text-sm">
            Rows: {preview.rows} <br />
            Duplicates: {preview.duplicates} <br />
            Errors: {preview.errors}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-3 py-1 rounded">
            Cancel
          </button>

          <button
            onClick={previewData}
            disabled={!rows.length}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            Preview
          </button>

          <button
            onClick={importRows}
            disabled={!preview}
            className="bg-sky-600 text-white px-3 py-1 rounded"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}