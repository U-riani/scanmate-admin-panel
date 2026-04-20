import { useState } from "react";
import { useCreateTransfer } from "../../queries/transferCreateMutation";
import { useWarehouses } from "../../queries/warehouseQuery";
import { usePocketUsers } from "../../queries/pocketUsersQuery";
import { useWarehouseStore } from "../../store/warehouseStore";
import { mockPocketRoles } from "../../data/mockPocketRoles";
import { useAuthStore } from "../../store/authStore";

export default function CreateTransferModal({ open, onClose }) {
  const { data: warehouses = [] } = useWarehouses();
  const { data: users = [] } = usePocketUsers();
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const createMutation = useCreateTransfer();

  const allowedWarehouseIds = useAuthStore(
    (state) => state.user?.warehouses || [],
  );

  const [form, setForm] = useState({
    name: "",
    number: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    module: "transfer",
    scan_type: "barcode",
    sender_user_ids: [],
    receiver_user_ids: [],
  });

  console.log("warehouses", warehouses);
  if (!open) return null;

  const allowedWarehouses = warehouses.filter((w) => {
    return allowedWarehouseIds.includes(w.id);
  });

  const senderUsers = users.filter((u) => {
    const role = mockPocketRoles.find((r) => r.id === u.role_id);

    return (
      (u.warehouses || []).includes(Number(form.from_warehouse_id)) &&
      role?.modules?.transfer === true &&
      u.active === true
    );
  });

  console.log("senderUsers", senderUsers);

  const receiverUsers = form.to_warehouse_id
    ? users.filter((u) => {
        const role = mockPocketRoles.find((r) => r.id === u.role_id);

        return (
          (u.warehouses || []).includes(Number(form.to_warehouse_id)) &&
          role?.modules?.transfer === true &&
          u.active === true
        );
      })
    : [];

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "from_warehouse_id" ? { sender_user_ids: [] } : {}),
      ...(field === "to_warehouse_id" ? { receiver_user_ids: [] } : {}),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        setForm({
          name: "",
          number: "",
          from_warehouse_id: "",
          to_warehouse_id: "",
          module: "transfer",
          scan_type: "barcode",
          sender_user_ids: [],
          receiver_user_ids: [],
        });
        onClose();
      },
    });
  }

  const otherWarehouses = warehouses.filter(
    (w) => w.id !== Number(form.from_warehouse_id),
  );

  return (
    <div className="glass-modal-backdrop">
      <div
        className="glass-modal"
        style={{ width: 500, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Create Transfer</h2>
          <button className="glass-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Transfer Name</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. March Restock"
              className="glass-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Transfer Number</label>
            <input
              value={form.number}
              onChange={(e) => updateField("number", e.target.value)}
              placeholder="e.g. TR-2025-001"
              className="glass-input font-mono"
              required
            />
          </div>

          <div>
            <label className="field-label">From Warehouse</label>
            <select
              value={form.from_warehouse_id}
              onChange={(e) =>
                updateField(
                  "from_warehouse_id",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="glass-select"
              required
            >
              <option value="">Select sender warehouse</option>
              {allowedWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">To Warehouse</label>
            <select
              value={form.to_warehouse_id}
              onChange={(e) =>
                updateField("to_warehouse_id", Number(e.target.value))
              }
              className="glass-select"
              required
            >
              <option value="">Select destination</option>
              {otherWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Transfer Type</label>
            <select
              value={form.scan_type}
              onChange={(e) => updateField("scan_type", e.target.value)}
              className="glass-select"
            >
              <option value="barcode">Barcode</option>
              <option value="loots">Loots</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <p>
              Sender users (Warehouse:
              {warehouses.find((w) => w.id === form.from_warehouse_id)?.name})
            </p>
            <div className="space-y-1">
              {senderUsers.map((u) => {
                const checked = form.sender_user_ids.includes(u.id);

                return (
                  <label key={u.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField("sender_user_ids", [
                            ...form.sender_user_ids,
                            u.id,
                          ]);
                        } else {
                          updateField(
                            "sender_user_ids",
                            form.sender_user_ids.filter((id) => id !== u.id),
                          );
                        }
                      }}
                    />
                    {u.username}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p>
              Receiver users (Warehouse:
              {warehouses.find((w) => w.id === form.to_warehouse_id)?.name})
            </p>
            <div className="space-y-1">
              {!form.to_warehouse_id ? (
                <p className="text-sm text-gray-500">
                  First select recaiver warehouse
                </p>
              ) : (
                receiverUsers.length == 0 && (
                  <p className="text-sm text-gray-500">
                    No users for selected receiver warehouse
                  </p>
                )
              )}
              {receiverUsers.map((u) => {
                const checked = form.receiver_user_ids.includes(u.id);

                return (
                  <label key={u.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField("receiver_user_ids", [
                            ...form.receiver_user_ids,
                            u.id,
                          ]);
                        } else {
                          updateField(
                            "receiver_user_ids",
                            form.receiver_user_ids.filter((id) => id !== u.id),
                          );
                        }
                      }}
                    />
                    {u.username}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !form.name ||
                !form.number ||
                !form.from_warehouse_id ||
                !form.to_warehouse_id ||
                form.sender_user_ids.length === 0 ||
                form.receiver_user_ids.length === 0
              }
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {createMutation.isPending ? "Creating…" : "Create Transfer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
