import { useState, useEffect } from "react";
import { authenticate } from "../../api/authService";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../app/paths";

export default function Login() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(PATHS.ROOT);
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await authenticate(email, password);
      setSession(session);
      navigate(PATHS.ROOT);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-96 space-y-4"
      >
        <h2 className="text-xl font-semibold">Scanmate Admin</h2>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={isSubmitting}
          className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
