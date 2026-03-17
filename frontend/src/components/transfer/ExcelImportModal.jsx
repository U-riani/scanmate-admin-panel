// src/components/transfer/ExcelImportModal.jsx

import * as XLSX from "xlsx";

export default function ExcelImportModal({ documentId, onImport }) {

  function handleFile(e) {

    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (evt) => {

      const data = new Uint8Array(evt.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet);

      const products = rows.map((r) => ({
        barcode: r.barcode,
        article_code: r.article_code,
        product_name: r.product_name,
        expected_qty: r.expected_qty
      }));

      onImport(products);

    };

    reader.readAsArrayBuffer(file);
  }

  return (

    <input
      type="file"
      accept=".xlsx"
      onChange={handleFile}
    />

  );

}