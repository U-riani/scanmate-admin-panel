import { useState } from "react";
import { useParams } from "react-router-dom";
import { useInventorizations } from "../../queries/inventorizationQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useInventorizationLines } from "../../queries/inventorizationLinesQuery";
import { useInventorizationStatusMutation } from "../../queries/inventorizationStatusMutation";
import { useCreateRecount } from "../../queries/inventorizationRecountMutation";
import { preloadLinesFromWarehouse } from "../../api/inventorizationLinesService";
import StatusBadge from "../../components/documents/StatusBadge";
import ImportInventorizationExcelModal from "../../components/inventorization/ImportInventorizationExcelModal";
import { INVENTORIZATION_FLOW } from "../../config/inventorizationStatusFlow";
import {
  downloadTemplate,
  TEMPLATES,
} from "../../utils/excel/downloadTemplate";
import StatusBarComponent from "../../components/reusable/StatusBarComponent";
import { InventorizationStatus } from "../../constants/statusData";

export default function InventorizationDetail() {
  const { id } = useParams();
  const [selectedLines, setSelectedLines] = useState([]);
  const [importOpen, setImportOpen] = useState(false);

  const { data: docs = [] } = useInventorizations();
  const { data: warehouses = [] } = useWarehouses();
  const { data: pocketUsers = [] } = usePocketUsers();
  const recountMutation = useCreateRecount();

  const doc = docs.find((d) => String(d.id) === id);
  const { data: lines = [] } = useInventorizationLines(doc?.id);
  const statusMutation = useInventorizationStatusMutation();
  console.log(lines);

  if (!doc)
    return (
      <div
        className="glass-card p-8 text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Document not found
      </div>
    );

  const warehouse = warehouses.find((w) => w.id === doc.warehouse_id);
  const employees = doc.employees
    .map((eid) => pocketUsers.find((u) => u.id === eid))
    .filter(Boolean);

  const totalLines = lines.length;
  const countedLines = lines.filter((l) => l.counted_qty !== null).length;
  const progress =
    totalLines === 0 ? 0 : Math.round((countedLines / totalLines) * 100);

  // function renderActions(status) {
  //   const allowed = INVENTORIZATION_FLOW[status] || [];
  //   return allowed.map((nextStatus) => (
  //     <button
  //       key={nextStatus}
  //       className="btn btn-primary btn-sm"
  //       onClick={async () => {
  //         if (nextStatus === "in_progress") {
  //           await preloadLinesFromWarehouse(doc.id, doc.warehouse_id);
  //         }
  //         statusMutation.mutate({ id: doc.id, status: nextStatus });
  //       }}
  //     >
  //       → {nextStatus.replace(/_/g, " ")}
  //     </button>
  //   ));
  // }

  function toggleRecount(lineId) {
    setSelectedLines((prev) =>
      prev.includes(lineId)
        ? prev.filter((x) => x !== lineId)
        : [...prev, lineId],
    );
  }

  function createRecount() {
    const recountItems = lines.filter((l) => selectedLines.includes(l.id));
    recountMutation.mutate({
      parent_document_id: doc.id,
      warehouse_id: doc.warehouse_id,
      employees: doc.employees,
      items: recountItems,
    });
    setSelectedLines([]);
  }

  function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-5">
      <ImportInventorizationExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        documentId={doc.id}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            Inventorization
            <span
              className="font-mono"
              style={{ color: "var(--accent-cyan)", fontSize: "1.1rem" }}
            >
              #{doc.id}
            </span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.8125rem",
              marginTop: "2px",
            }}
          >
            {doc.name}
          </p>
        </div>
        <div>
          <StatusBarComponent
            documentId={doc.id}
            statusObject={InventorizationStatus}
            currentStatus={doc.status}
          />
        </div>
        {doc?.status === "draft" && (
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() =>
                downloadTemplate(
                  TEMPLATES.inventorizationLines.headers,
                  TEMPLATES.inventorizationLines.filename,
                )
              }
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Download Template
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setImportOpen(true)}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import Excel
            </button>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div className="info-row">
            <span className="info-label">Warehouse</span>
            <span className="info-value">{warehouse?.name ?? "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Type</span>
            <span className="info-value">{doc.scan_type}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status</span>
            <span className="info-value">
              <StatusBadge status={doc.status} />
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Employees</span>
            <span className="info-value">
              {employees.map((e) => e.username).join(", ") || "—"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Created</span>
            <span
              className="info-value cell-mono"
              style={{ fontSize: "0.82rem" }}
            >
              {formatDate(doc.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* <div className="glass-card p-5">
          <p className="section-label mb-3">Available Actions</p>
          <div className="flex gap-2 flex-wrap">
            {renderActions(doc.status)}
            {(INVENTORIZATION_FLOW[doc.status] || []).length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                No transitions available
              </p>
            )}
          </div>
        </div> */}

        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="section-label">Counting Progress</p>
            <span
              className="font-mono"
              style={{
                color: "var(--accent-cyan)",
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              {progress}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            {countedLines} / {totalLines} lines counted
          </p>
        </div>
      </div>

      {/* Lines table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
            Inventorization Lines
          </h2>
          {selectedLines.length > 0 && (
            <button className="btn btn-warning btn-sm" onClick={createRecount}>
              Create Recount ({selectedLines.length})
            </button>
          )}
        </div>

        <div className="glass-table-wrapper">
          <table className="glass-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Barcode</th>
                <th>Article</th>
                <th>Product</th>
                <th>Expected</th>
                <th>Counted</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "2rem",
                    }}
                  >
                    No lines — start inventorization to load products
                  </td>
                </tr>
              ) : (
                lines.map((line) => {
                  const diff =
                    line.counted_qty === null
                      ? null
                      : line.counted_qty - line.expected_qty;
                  return (
                    <tr key={line.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="glass-checkbox"
                          checked={selectedLines.includes(line.id)}
                          onChange={() => toggleRecount(line.id)}
                        />
                      </td>
                      <td className="cell-mono">{line.barcode}</td>
                      <td className="cell-mono">{line.article_code}</td>
                      <td style={{ fontWeight: 500 }}>{line.product_name}</td>
                      <td className="cell-mono">{line.expected_qty}</td>
                      <td className="cell-mono">{line.counted_qty ?? "—"}</td>
                      <td>
                        {diff === null ? (
                          <span className="diff-zero">—</span>
                        ) : diff === 0 ? (
                          <span className="diff-zero">0</span>
                        ) : diff > 0 ? (
                          <span className="diff-positive">+{diff}</span>
                        ) : (
                          <span className="diff-negative">{diff}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
