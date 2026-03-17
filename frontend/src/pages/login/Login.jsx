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
    if (user) navigate(PATHS.ROOT);
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
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Animated background orbs */}
      <div
        className="login-orb"
        style={{
          width: 480, height: 480,
          top: "-10%", right: "-5%",
          background: "var(--accent-cyan)",
          animationDelay: "0s",
        }}
      />
      <div
        className="login-orb"
        style={{
          width: 400, height: 400,
          bottom: "-8%", left: "-8%",
          background: "var(--accent-purple)",
          animationDelay: "-3s",
        }}
      />
      <div
        className="login-orb"
        style={{
          width: 260, height: 260,
          top: "40%", left: "10%",
          background: "var(--accent-cyan)",
          opacity: 0.07,
          animationDelay: "-5s",
        }}
      />

      {/* Card */}
      <div
        className="glass-modal relative z-10 w-full mx-4 page-enter"
        style={{ maxWidth: 400 }}
      >
        <div className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)",
                boxShadow: "0 0 32px var(--accent-cyan-glow)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h1
              className="text-xl font-bold tracking-widest"
              style={{ color: "var(--text-primary)", letterSpacing: "0.15em" }}
            >
              SCANMATE
            </h1>
            <p
              className="text-xs mt-1 tracking-widest"
              style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
            >
              ADMIN CONSOLE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="admin@scanmate.ge"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: "0.5rem" }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Authenticating…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p
            className="text-center mt-6 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Warehouse Operations Platform
          </p>
        </div>
      </div>
    </div>
  );
}
