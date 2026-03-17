// frontend/src/components/users/ResetWebsitePasswordModal.jsx

import { useState } from "react";
import { useResetWebsiteUserPassword } from "../../queries/websiteUsersMutation";

export default function ResetWebsitePasswordModal({ user, open, onClose }) {
  const { mutate, isPending } = useResetWebsiteUserPassword();
  const [password, setPassword] = useState("");

  if (!open || !user) return null;

  function handleSubmit(e) {
    e.preventDefault();

    mutate(
      {
        id: user.id,
        password,
      },
      {
        onSuccess: () => {
          setPassword("");
          onClose();
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded bg-white p-6 shadow">
        <h2 className="mb-2 text-lg font-semibold">Reset Website User Password</h2>
        <p className="mb-4 text-sm text-gray-500">
          User: <span className="font-medium text-gray-700">{user.username}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded border p-2"
            required
          />

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-60"
            >
              {isPending ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPassword("");
                onClose();
              }}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}