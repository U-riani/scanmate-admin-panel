// frontend\src\pages\receive\ReceiveDetail.jsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useReceives } from "../../queries/receiveQuery";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import {
  useReceiveLines,
  useUpdateReceiveLineQuantity,
} from "../../queries/receiveLinesQuery";
import {
  useReceiveStatusMutation,
  useCreateRecount,
} from "../../queries/receiveMutation";
// import { useTransferLines } from "../../queries/transferLinesQuery";

// import { useCreateRecount } from "../../queries/receiveRecountMutation";
// import { preloadLinesFromWarehouse } from "../../api/receiveLinesService";
import StatusBadge from "../../components/documents/StatusBadge";
import { RECEIVE_FLOW } from "../../config/receiveStatusFlow";
import {
  downloadTemplate,
  TEMPLATES,
} from "../../utils/excel/downloadTemplate";
import ImportReceiveExcelModal from "../../components/receive/ImportReceiveExcelModal";
import StatusBarComponent from "../../components/reusable/StatusBarComponent";
import {
  ReceiveStatus,
  uploadAllowedStatuses,
  InventorizationReceiveShowRecountQuantity,
  allowedInventorizationAndReceiveStatuses,
} from "../../constants/statusData";

export default function ReceiveDetail() {
  const { id } = useParams();
  const [selectedLines, setSelectedLines] = useState([]);
  const [importOpen, setImportOpen] = useState(false);

  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data: docs = [] } = useReceives();
  const { data: warehouses = [] } = useWarehouses();
  const { data: pocketUsers = [] } = usePocketUsers();
  const recountMutation = useCreateRecount();

  const doc = docs.find((d) => String(d.id) === id);
  const { data: lines = [] } = useReceiveLines(doc?.id);

  const updateLineQuantityMutation = useUpdateReceiveLineQuantity(doc?.id);
  const canEditQuantities =
    doc?.status &&
    allowedInventorizationAndReceiveStatuses.includes(doc.status);

  const statusMutation = useReceiveStatusMutation();

  const [selectedRecountEmployees, setSelectedRecountEmployees] = useState([]);

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

  const employees = doc.receiver_user_ids
    .map((eid) => pocketUsers.find((u) => u.id === eid))
    .filter(Boolean);

  const totalLines = lines.length;
  const countedLines = lines.filter((l) => l.counted_qty !== null).length;
  const progress =
    totalLines === 0 ? 0 : Math.round((countedLines / totalLines) * 100);

  function renderActions(status) {
    const allowed = RECEIVE_FLOW[status] || [];
    return allowed.map((nextStatus) => (
      <button
        key={nextStatus}
        className="btn btn-primary btn-sm"
        onClick={async () => {
          if (nextStatus === "in_progress") {
            await preloadLinesFromWarehouse(doc.id, doc.warehouse_id);
          }
          statusMutation.mutate({
            id: doc.id,
            prevStatus: doc.status,
            nextStatus,
          });
        }}
      >
        → {nextStatus.replace(/_/g, " ")}
      </button>
    ));
  }

  function toggleRecount(lineId) {
    setSelectedLines((prev) =>
      prev.includes(lineId)
        ? prev.filter((x) => x !== lineId)
        : [...prev, lineId],
    );
  }

  function toggleRecountEmployee(userId) {
    setSelectedRecountEmployees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  console.log("+++receivee", doc);
  function createRecount() {
    const recountItems = lines.filter((l) => selectedLines.includes(l.id));
    const recountPayload = recountItems.map((line) => line.id);

    recountMutation.mutate({
      parent_document_id: doc.id,
      employees: doc.receiver_user_ids,
      line_ids: recountPayload,
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

  function startEdit(lineId, field, currentValue) {
    if (!canEditQuantities) return;

    setEditingCell({ lineId, field });
    setEditValue(currentValue ?? "");
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditValue("");
  }

  function confirmEdit(line, field) {
    const numericValue = Number(editValue);

    if (editValue === "" || Number.isNaN(numericValue) || numericValue < 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    const oldValue = line[field] ?? "";

    if (String(oldValue) === String(numericValue)) {
      cancelEdit();
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to update ${field.replace("_", " ")} from ${
        oldValue === "" ? "—" : oldValue
      } to ${numericValue}?`,
    );

    if (!confirmed) return;

    updateLineQuantityMutation.mutate({
      lineId: line.id,
      payload: {
        [field]: numericValue,
      },
    });

    cancelEdit();
  }

  function renderEditableQty(line, field) {
    const isEditing =
      editingCell?.lineId === line.id && editingCell?.field === field;

    if (!canEditQuantities) {
      return <span>{line[field] ?? "—"}</span>;
    }

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            className="w-20 rounded-md bg-transparent border border-gray-500 px-2 py-1 text-sm"
            value={editValue}
            autoFocus
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmEdit(line, field);
              if (e.key === "Escape") cancelEdit();
            }}
          />

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => confirmEdit(line, field)}
            disabled={updateLineQuantityMutation.isPending}
          >
            ✓
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={cancelEdit}
            disabled={updateLineQuantityMutation.isPending}
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        className="cell-mono underline decoration-dotted hover:text-cyan-300"
        onClick={() => startEdit(line.id, field, line[field])}
        title="Click to edit"
      >
        {line[field] ?? "—"}
      </button>
    );
  }

  return (
    <div className="space-y-5">
      <ImportReceiveExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        documentId={doc.id}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            Receive{" "}
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
        <div className="flex flex-col items-end justify-between gap-3">
          <div>
            <StatusBarComponent
              documentId={doc.id}
              statusObject={ReceiveStatus}
              currentStatus={doc.status}
              module="receive"
            />
          </div>
          {uploadAllowedStatuses.includes(doc.status) && (
            <div className="flex gap-2 flex-wrap">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  downloadTemplate(
                    TEMPLATES.receiveLines.headers,
                    TEMPLATES.receiveLines.filename,
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

      {/* Actions + Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <p className="section-label mb-3">Available Actions</p>
          <div className="flex gap-2 flex-wrap">
            {renderActions(doc.status)}
            {(RECEIVE_FLOW[doc.status] || []).length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                No transitions available
              </p>
            )}
          </div>
        </div>

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
            Receive Lines
          </h2>
          <div className="flex gap-2 flex-wrap">
            {employees?.map((e) => {
              const selected = selectedRecountEmployees.includes(e.id);

              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleRecountEmployee(e.id)}
                  className={`rounded-2xl px-3 py-1 text-sm border ${
                    selected
                      ? "bg-amber-700 border-amber-500 text-white"
                      : "bg-transparent border-gray-500 text-gray-300"
                  }`}
                >
                  {e.username}
                </button>
              );
            })}
          </div>
          {selectedLines?.length > 0 && (
            <button
              className="btn btn-warning btn-sm"
              onClick={createRecount}
              disabled={selectedRecountEmployees.length === 0}
              title={
                selectedRecountEmployees.length === 0
                  ? "Select at least 1 employee"
                  : ""
              }
            >
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
                {doc?.status &&
                  InventorizationReceiveShowRecountQuantity.includes(
                    doc.status,
                  ) && <th>Recounted qty</th>}
                <th>Diff</th>
                <th>Rec_Diff</th>
              </tr>
            </thead>
            <tbody>
              {lines?.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      doc?.status &&
                      InventorizationReceiveShowRecountQuantity.includes(
                        doc.status,
                      )
                        ? 9
                        : 8
                    }
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "2rem",
                    }}
                  >
                    No lines — start receive to load products
                  </td>
                </tr>
              ) : (
                lines?.map((line) => {
                  const diff =
                    line.counted_qty === null
                      ? null
                      : line.counted_qty - line.expected_qty;

                  const diffRecount =
                    line.recount_qty === null
                      ? null
                      : line.recount_qty - line.expected_qty;
                  return (
                    <tr
                      key={line.id}
                      className={`${line.recount_requested ? "bg-amber-950   " : ""}`}
                    >
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
                      <td className="cell-mono">
                        {renderEditableQty(line, "expected_qty")}
                      </td>

                      <td className="cell-mono">
                        {renderEditableQty(line, "counted_qty")}
                      </td>
                      {doc?.status &&
                        InventorizationReceiveShowRecountQuantity.includes(
                          doc.status,
                        ) && (
                          <td className="cell-mono">
                            {renderEditableQty(line, "recount_qty")}
                          </td>
                        )}
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
                      {line.recount_requested && (
                        <td>
                          {diffRecount === null ? (
                            <span className="diff-zero">—</span>
                          ) : diffRecount === 0 ? (
                            <span className="diff-zero">0</span>
                          ) : diffRecount > 0 ? (
                            <span className="diff-positive">
                              +{diffRecount}
                            </span>
                          ) : (
                            <span className="diff-negative">{diffRecount}</span>
                          )}
                        </td>
                      )}
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
