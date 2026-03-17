import * as XLSX from "xlsx";

/**
 * Download an .xlsx template file with the given column headers.
 * @param {string[]} headers   Column header names
 * @param {string}   filename  Filename without extension
 */
export function downloadTemplate(headers, filename) {
  const ws = XLSX.utils.aoa_to_sheet([headers]);

  // Style the header row width for readability
  ws["!cols"] = headers.map(() => ({ wch: 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export const TEMPLATES = {
  priceRows: {
    headers: ["Barcode", "Name", "Category", "Color", "Size", "Group", "Article", "Base Price", "Adjusted Price"],
    filename: "price_rows_template",
  },
  inventorizationLines: {
    headers: ["Barcode", "Article", "Product", "Expected Qty"],
    filename: "inventorization_lines_template",
  },
  transferLines: {
    headers: ["barcode", "article_code", "product_name", "expected_qty"],
    filename: "transfer_lines_template",
  },
};
