// // src/components/sales/UploadPriceListModal.jsx

// import { useState } from "react";
// import { useCreatePriceUpload } from "../../queries/priceUploadMutation";
// import { useWarehouses } from "../../queries/warehouseQuery";
// import { useAuthStore } from "../../store/authStore";
// import { parsePriceExcel } from "../../utils/excel/priceExcelParser";

// export default function UploadPriceListModal({ open, onClose }) {
//   const { data: warehouses = [] } = useWarehouses();
//   const user = useAuthStore((s) => s.user);
//   const createMutation = useCreatePriceUpload();

//   const [warehouseId, setWarehouseId] = useState("");
//   const [fileName, setFileName] = useState("price_upload.xlsx");
//   const [previewMode, setPreviewMode] = useState(false);
//   const [result, setResult] = useState(null);
//   const [rows, setRows] = useState([]);

//   if (!open) return null;

//   const allowedWarehouses = warehouses.filter((w) =>
//     (user?.warehouses || []).includes(w.id)
//   );

//   async function handleFile(e) {
//     const file = e.target.files[0];
//     if (!file) return;

//     setFileName(file.name);

//     const parsed = await parsePriceExcel(file);

//     const mapped = parsed.map((row) => ({
//       barcode: String(row["Barcode"] ?? "").trim(),
//       name: row["Name"] ?? "",
//       category: row["Category"] ?? "",
//       color: row["Color"] ?? "",
//       size: row["Size"] ?? "",
//       group: row["Group"] ?? "",
//       article: row["Article"] ?? "",
//       base_price: Number(row["Base Price"]),
//       adjusted_price: Number(row["Adjusted Price"]),
//     }));

//     setRows(mapped);
//     setPreviewMode(false);
//     setResult(null);
//   }

//   function handlePreview() {
//     if (!rows.length) return;

//     const seen = new Set();
//     let duplicateCount = 0;
//     let errorCount = 0;

//     rows.forEach((row) => {
//       if (!row.barcode || isNaN(row.base_price) || isNaN(row.adjusted_price)) {
//         errorCount++;
//       }

//       if (seen.has(row.barcode)) {
//         duplicateCount++;
//       }

//       seen.add(row.barcode);
//     });

//     setPreviewMode(true);

//     setResult({
//       rows_count: rows.length,
//       duplicate_count: duplicateCount,
//       error_rows_count: errorCount,
//     });
//   }

//   function handleUpload() {
//     createMutation.mutate(
//       {
//         warehouse_id: Number(warehouseId),
//         file_name: fileName,
//         uploaded_by: user?.id || 1,
//         rows: rows,
//       },
//       {
//         onSuccess: () => {
//           setWarehouseId("");
//           setRows([]);
//           setFileName("price_upload.xlsx");
//           setPreviewMode(false);
//           setResult(null);
//           onClose();
//         },
//       }
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-white rounded shadow w-[560px] p-6 space-y-4">
//         <h2 className="text-xl font-semibold">Upload Price List</h2>

//         <div>
//           <label className="text-sm text-gray-600">Warehouse</label>
//           <select
//             value={warehouseId}
//             onChange={(e) => setWarehouseId(e.target.value)}
//             className="w-full border rounded px-3 py-2"
//           >
//             <option value="">Select warehouse</option>
//             {allowedWarehouses.map((w) => (
//               <option key={w.id} value={w.id}>
//                 {w.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="text-sm text-gray-600">File Name</label>
//           <input
//             value={fileName}
//             onChange={(e) => setFileName(e.target.value)}
//             className="w-full border rounded px-3 py-2"
//           />
//         </div>

//         <div>
//           <label className="text-sm text-gray-600">Excel File</label>
//           <input
//             type="file"
//             accept=".xlsx,.xls"
//             onChange={handleFile}
//             className="w-full"
//           />
//         </div>

//         {previewMode && result && (
//           <div className="border rounded p-4 bg-gray-50 text-sm space-y-1">
//             <div>Rows detected: {result.rows_count}</div>
//             <div>Duplicate barcodes: {result.duplicate_count}</div>
//             <div>Error rows: {result.error_rows_count}</div>
//           </div>
//         )}

//         <div className="flex justify-end gap-2">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-3 py-2 border rounded"
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             onClick={handlePreview}
//             disabled={!warehouseId || !rows.length}
//             className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
//           >
//             Preview
//           </button>

//           <button
//             type="button"
//             onClick={handleUpload}
//             disabled={!warehouseId || !previewMode}
//             className="px-3 py-2 bg-sky-600 text-white rounded disabled:opacity-50"
//           >
//             Upload
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }