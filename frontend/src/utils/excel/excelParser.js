// src/utils/excel/excelParser.js

import * as XLSX from "xlsx";

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      resolve(rows);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}