import { useState } from "react";
import { useCreatePriceUpload } from "../../queries/priceUploadMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../app/paths";

export default function CreatePriceListModal({ open, onClose }) {
  const { data: warehouses = [] } = useWarehouses();
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreatePriceUpload();
  const navigate = useNavigate();
  const [warehouseId, setWarehouseId] = useState("");
  const [name, setName] = useState("");

  if (!open) return null;

  const allowedWarehouses = warehouses.filter((w) =>
    (user?.warehouses || []).includes(w.id)
  );

  function handleCreate() {
    createMutation.mutate(
      {
        warehouse_id: Number(warehouseId),
        file_name: name || "manual_price_list",
        uploaded_by: user?.id || 1,
        rows: [],
      },
      {
        onSuccess: (data) => {
          onClose();
          navigate(PATHS.SALES_PRICE_LIST_DETAIL(data.id));
        },
      }
    );
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 440 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">New Price List</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="field-label">Warehouse</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="glass-select"
            >
              <option value="">Select warehouse</option>
              {allowedWarehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Price List Name</label>
            <input
              placeholder="e.g. Spring 2025 Prices"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              disabled={!warehouseId || createMutation.isPending}
              onClick={handleCreate}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {createMutation.isPending ? "Creating…" : "Create & Open"}
            </button>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
