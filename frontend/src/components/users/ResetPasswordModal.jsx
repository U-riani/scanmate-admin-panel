import { useState } from "react";
import { useResetPocketUserPassword } from "../../queries/pocketUsersMutation";

export default function ResetPasswordModal({ user, open, onClose }) {
  const { mutate } = useResetPocketUserPassword();
  const [password, setPassword] = useState("");

  if (!open || !user) return null;

  function handleSubmit(e) {
    e.preventDefault();
    mutate({ id: user.id, password });
    setPassword("");
    onClose();
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 400 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Reset Password</h2>
          <button className="glass-modal-close" onClick={() => { setPassword(""); onClose(); }}>✕</button>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Setting new password for{" "}
          <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>{user.username}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Reset Password</button>
            <button type="button" onClick={() => { setPassword(""); onClose(); }} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
