// frontend\src\pages\transfer\TransferDetail.jsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useTransfers } from "../../queries/transferQuery";
import { useTransferLines } from "../../queries/transferLinesQuery";
import { useTransferStatusMutation } from "../../queries/transferStatusMutation";
import { useCreateTransferRecount } from "../../queries/transferRecountMutation";
import {
  useAddTransferLines,
  useUpdateTransferLine,
  useDeleteTransferLine,
  useImportTransferLines,
} from "../../queries/transferLinesMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import AddProductModal from "../../components/transfer/AddProductModal";
import WarehouseProductSelector from "../../components/transfer/WarehouseProductSelector";
import ExcelImportModal from "../../components/transfer/ExcelImportModal";
import StatusBadge from "../../components/documents/StatusBadge";
import { TRANSFER_FLOW } from "../../config/transferStatusFlow";
import StatusBarComponent from "../../components/reusable/StatusBarComponent";
import {
  TransferStatus,
  TransferStatusLabels,
  uploadAllowedStatuses,
} from "../../constants/statusData";
import {
  downloadTemplate,
  TEMPLATES,
} from "../../utils/excel/downloadTemplate";
import { toast } from "react-hot-toast";

function getTransferStage(status) {
  const senderStages = [
    "waiting_to_start",
    "sender_in_progress",
    "sender_completed",
    "sender_recount_requested",
    "sender_recount_in_progress",
    "sender_recount_completed",
  ];

  const receiverStages = [
    "waiting_receiver_to_start",
    "receive_in_progress",
    "receive_completed",
    "receive_recount_requested",
    "receive_recount_in_progress",
    "receive_recount_completed",
  ];

  if (receiverStages.includes(status)) return "receiver";
  if (senderStages.includes(status)) return "sender";

  return "sender";
}

export default function TransferDetail() {
  const { id } = useParams();
  const { data: docs = [] } = useTransfers();
  const { data: warehouses = [] } = useWarehouses();
  const { data: users = [] } = usePocketUsers();

  const doc = docs.find((d) => String(d.id) === id);
  const { data: lines = [] } = useTransferLines(doc?.id);

  const statusMutation = useTransferStatusMutation();
  const addLinesMutation = useAddTransferLines();
  const importLinesMutation = useImportTransferLines();
  const updateLineMutation = useUpdateTransferLine();
  const deleteLineMutation = useDeleteTransferLine();

  const [addModal, setAddModal] = useState(false);
  const [excelModal, setExcelModal] = useState(false);
  const [warehouseSelector, setWarehouseSelector] = useState(false);

  const [selectedLines, setSelectedLines] = useState([]);
  const [selectedRecountEmployees, setSelectedRecountEmployees] = useState([]);
  const [recountError, setRecountError] = useState("");

  const recountMutation = useCreateTransferRecount();
  console.log(lines);
  if (!doc)
    return (
      <div
        className="glass-card p-8 text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Transfer not found
      </div>
    );

  const currentStage = getTransferStage(doc.status);
  const recountCandidates =
    currentStage === "sender" ? doc.sender_user_ids : doc.receiver_user_ids;
  const recountUsers = users.filter((u) => recountCandidates.includes(u.id));

  function getWarehouseName(wid) {
    return warehouses.find((w) => w.id === wid)?.name ?? "—";
  }
  function getUserName(uid) {
    return users.find((u) => u.id === uid)?.username ?? "—";
  }

  function getUserNames(ids) {
    if (!ids || ids.length === 0) return "—";

    return ids
      .map((id) => users.find((u) => u.id === id)?.username)
      .filter(Boolean)
      .join(", ");
  }
  function renderActions(status) {
    const allowed = TRANSFER_FLOW[status] || [];
    return allowed.map((next) => (
      <button
        key={next}
        className="btn btn-primary btn-sm"
        onClick={() =>
          statusMutation.mutate({
            id: doc.id,
            prevStatus: doc.status,
            nextStatus: next,
          })
        }
      >
        → {next.replace(/_/g, " ")}
      </button>
    ));
  }

  function addProduct(product) {
    addLinesMutation.mutate({ documentId: doc.id, products: [product] });
  }

  function addWarehouseProduct(product) {
    addLinesMutation.mutate({ documentId: doc.id, products: [product] });
    setWarehouseSelector(false);
  }

  function importExcel(products) {
    importLinesMutation.mutate({ documentId: doc.id, products });

    toast.success(`${products.length} lines imported`);

    setExcelModal(false);
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
  function createRecount() {
    if (selectedRecountEmployees.length === 0) {
      setRecountError("Please select at least 1 employee for recount.");
      return;
    }

    if (selectedLines.length === 0) {
      setRecountError("Please select at least 1 line for recount.");
      return;
    }

    setRecountError("");

    recountMutation.mutate({
      parent_document_id: doc.id,
      role: currentStage,
      employees: selectedRecountEmployees,
      line_ids: selectedLines,
    });

    setSelectedLines([]);
    setSelectedRecountEmployees([]);
  }
  return (
    <div className="space-y-5">
      {/* Header */}
      <ExcelImportModal
        open={excelModal}
        onClose={() => setExcelModal(false)}
        documentId={doc.id}
        onImport={importExcel}
      />
      <div className="flex justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            Transfer{" "}
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
            {doc.name} · {doc.number}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between gap-3">
          <div>
            <StatusBarComponent
              documentId={doc.id}
              statusObject={TransferStatus}
              currentStatus={doc.status}
              module="transfer"
            />
          </div>
          {uploadAllowedStatuses.includes(doc.status) && (
            <div className="flex gap-2 flex-wrap">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setAddModal(true)}
              >
                + Add Product
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  downloadTemplate(
                    TEMPLATES.transferLines.headers,
                    TEMPLATES.transferLines.filename,
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
                Template
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => setExcelModal(true)}
              >
                Import Excel
              </button>
              <button
                className="btn btn-purple btn-sm"
                onClick={() => setWarehouseSelector(!warehouseSelector)}
              >
                Warehouse Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      <AddProductModal
        open={addModal}
        onClose={() => setAddModal(false)}
        onAdd={addProduct}
      />

      {warehouseSelector && (
        <div className="glass-card p-5">
          <WarehouseProductSelector
            warehouseId={doc.from_warehouse_id}
            onSelect={addWarehouseProduct}
          />
        </div>
      )}

      {/* Info + Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <p className="section-label mb-3">Document Info</p>
          <div>
            <div className="info-row">
              <span className="info-label">From</span>
              <span className="info-value">
                {getWarehouseName(doc.from_warehouse_id)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">To</span>
              <span className="info-value">
                {getWarehouseName(doc.to_warehouse_id)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="info-value">
                <StatusBadge status={doc.status} />
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Sender</span>
              <span className="info-value">
                {getUserNames(doc.sender_user_ids)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Receiver</span>
              <span className="info-value">
                {getUserNames(doc.receiver_user_ids)}
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

        <div className="glass-card p-5">
          <p className="section-label mb-3">Actions</p>
          <div className="flex gap-2 flex-wrap">
            {renderActions(doc.status)}
            {(TRANSFER_FLOW[doc.status] || []).length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                No transitions available
              </p>
            )}
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 gap-3 mt-4 pt-4"
            style={{ borderTop: "1px solid var(--glass-border)" }}
          >
            {[
              { label: "Total Lines", value: doc.total_lines },
              { label: "Sent", value: doc.sent_lines },
              { label: "Received", value: doc.received_lines },
              { label: "Differences", value: doc.difference_lines },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="section-label">{label}</p>
                <p
                  className="font-mono"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {value ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lines table */}
      <div className="glass-card p-5">
        <h2
          style={{
            fontWeight: 600,
            fontSize: "0.9375rem",
            marginBottom: "1rem",
          }}
        >
          Transfer Lines
        </h2>
        <div>
          {["sender_completed", "receive_completed"].includes(doc.status) && (
            <div className="glass-card p-4 mt-4">
              <p className="section-label mb-3">
                Recount performers (
                {currentStage === "sender" ? "Sender side" : "Receiver side"})
              </p>

              <div className="flex gap-2 flex-wrap">
                {recountUsers.map((u) => {
                  const selected = selectedRecountEmployees.includes(u.id);

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() =>
                        setSelectedRecountEmployees((prev) =>
                          prev.includes(u.id)
                            ? prev.filter((id) => id !== u.id)
                            : [...prev, u.id],
                        )
                      }
                      className={`rounded-2xl px-3 py-1 text-sm border ${
                        selected
                          ? "bg-amber-700 border-amber-500 text-white"
                          : "bg-transparent border-gray-500 text-gray-300"
                      }`}
                    >
                      {u.username}
                    </button>
                  );
                })}
              </div>

              {recountError && (
                <div className="rounded-xl border border-red-500 bg-red-950/40 px-4 py-2 text-sm text-red-200 mt-3">
                  {recountError}
                </div>
              )}

              {selectedLines.length > 0 && (
                <button
                  className="btn btn-warning btn-sm mt-3"
                  onClick={createRecount}
                  disabled={selectedRecountEmployees.length === 0}
                >
                  Create Recount ({selectedLines.length})
                </button>
              )}
            </div>
          )}
        </div>
        <div className="glass-table-wrapper">
          <table className="glass-table">
            <thead>
              <tr>
                <th></th>
                <th>Barcode</th>
                <th>Article</th>
                <th>Product</th>
                <th>Expected</th>
                <th>Sent</th>
                <th>Received</th>
                <th>Snd_Recount_Qty</th>
                <th>Rec_Recount_Qty</th>
                <th>Diff</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "2rem",
                    }}
                  >
                    No lines yet — add products above
                  </td>
                </tr>
              ) : (
                lines.map((line) => {
                  const diff = line.sent_qty - line.received_qty;
                  console.log("line", line);
                  return (
                    <tr
                      key={line.id}
                      className={`
                        ${
                          line.sender_recount_requested &&
                          line.receiver_recount_requested
                            ? "bg-yellow-950"
                            : line.sender_recount_requested
                              ? "bg-amber-950"
                              : line.receiver_recount_requested
                                ? "bg-rose-950"
                                : ""
                        }
                      `}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedLines.includes(line.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLines((prev) => [...prev, line.id]);
                            } else {
                              setSelectedLines((prev) =>
                                prev.filter((id) => id !== line.id),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="cell-mono">{line.barcode}</td>
                      <td className="cell-mono">{line.article_code}</td>
                      <td style={{ fontWeight: 500 }}>{line.product_name}</td>
                      <td className="cell-mono">{line.expected_qty}</td>
                      <td>
                        <input
                          type="number"
                          value={line.sent_qty}
                          className="glass-input font-mono"
                          style={{
                            width: 80,
                            padding: "0.3rem 0.5rem",
                            textAlign: "center",
                          }}
                          onChange={(e) =>
                            updateLineMutation.mutate({
                              lineId: line.id,
                              data: { sent_qty: Number(e.target.value) },
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={line.received_qty}
                          className="glass-input font-mono"
                          style={{
                            width: 80,
                            padding: "0.3rem 0.5rem",
                            textAlign: "center",
                          }}
                          onChange={(e) =>
                            updateLineMutation.mutate({
                              lineId: line.id,
                              data: { received_qty: Number(e.target.value) },
                            })
                          }
                        />
                      </td>
                      <td>{line.sender_recounted_qty}</td>
                      <td>{line.receiver_recounted_qty}</td>
                      <td>
                        {diff === 0 ? (
                          <span className="diff-zero">0</span>
                        ) : diff > 0 ? (
                          <span className="diff-positive">+{diff}</span>
                        ) : (
                          <span className="diff-negative">{diff}</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteLineMutation.mutate(line.id)}
                        >
                          ✕
                        </button>
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
