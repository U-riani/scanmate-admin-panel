// frontend/src/components/users/ResetPasswordModal.jsx

import { useState } from "react";
import { useResetPocketUserPassword } from "../../queries/pocketUsersMutation";

export default function ResetPasswordModal({ user, open, onClose }) {

  const { mutate } = useResetPocketUserPassword();
  const [password, setPassword] = useState("");

  if (!open || !user) return null;

  function handleSubmit(e) {
    e.preventDefault();

    mutate({
      id: user.id,
      password
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded w-96">

        <h2 className="text-lg font-semibold mb-4">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="password"
            placeholder="New password"
            className="border p-2 w-full rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-2 pt-3">

            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}