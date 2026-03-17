// src/components/inventorization/ImportInventorizationExcelModal.jsx

import { useState } from "react";
import { parseInventorizationExcel } from "../../utils/excel/inventorizationExcelParser";
import { useImportInventorizationLines } from "../../queries/inventorizationMutation";

export default function ImportInventorizationExcelModal({
  open,
  onClose,
  documentId,
}) {
  const importMutation = useImportInventorizationLines();

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  if (!open) return null;

  async function handleFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    const parsed = await parseInventorizationExcel(file);

    const mapped = parsed.map((row) => ({
      barcode: String(row["Barcode"]),
      article_code: row["Article"],
      product_name: row["Product"],
      expected_qty: Number(row["Expected Qty"]),
    }));

    setRows(mapped);

    setSummary({
      rows: mapped.length,
    });
  }

  function handleImport() {
    importMutation.mutate(
      {
        documentId,
        rows,
      },
      {
        onSuccess: () => {
          setRows([]);
          setSummary(null);
          onClose();
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-[520px] space-y-4">
        <h2 className="text-xl font-semibold">
          Import Inventorization Items
        </h2>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
        />

        {summary && (
          <div className="bg-gray-100 p-3 rounded text-sm">
            Rows detected: {summary.rows}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border px-3 py-1 rounded"
          >
            Cancel
          </button>

          <button
            disabled={!rows.length}
            onClick={handleImport}
            className="bg-sky-600 text-white px-3 py-1 rounded"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}