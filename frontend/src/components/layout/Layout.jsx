import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import WarehouseSelector from "./WarehouseSelector";
import { useAuthStore } from "../../store/authStore";
import { PATHS } from "../../app/paths";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleLogOut() {
    logout();
    navigate(PATHS.LOGIN, { replace: true });
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* ── Top Header ── */}
        <header
          className="glass-header sticky top-0 z-10 flex items-center justify-between px-5"
          style={{ height: "var(--header-height)" }}
        >
          {/* Left: hamburger + brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex flex-col gap-1.5 p-2 rounded-lg transition-all"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Toggle sidebar"
            >
              <span
                className="block h-px w-5 transition-all"
                style={{
                  background: "var(--text-secondary)",
                  transform: sidebarOpen ? "rotate(45deg) translateY(5px)" : "none",
                }}
              />
              <span
                className="block h-px w-5 transition-all"
                style={{
                  background: "var(--text-secondary)",
                  opacity: sidebarOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-px w-5 transition-all"
                style={{
                  background: "var(--text-secondary)",
                  transform: sidebarOpen ? "rotate(-45deg) translateY(-5px)" : "none",
                }}
              />
            </button>

            <span
              className="text-sm font-semibold tracking-wide"
              style={{ color: "var(--text-secondary)", display: !sidebarOpen ? "block" : "none" }}
            >
              SCANMATE
            </span>
          </div>

          {/* Right: warehouse selector + user + logout */}
          <div className="flex items-center gap-3">
            <WarehouseSelector />

            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                  color: "#fff",
                }}
              >
                {initials}
              </div>
              <div className="leading-none">
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {user?.username || "User"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: "1px" }}>
                  {user?.role?.name || ""}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogOut}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main
          key={location.pathname}
          className="flex-1 p-6 page-enter"
          style={{ minHeight: 0 }}
        >
          <Outlet />
        </main>

        {/* ── Footer ── */}
        <footer
          className="px-6 py-3 text-center"
          style={{
            borderTop: "1px solid var(--glass-border)",
            color: "var(--text-muted)",
            fontSize: "0.72rem",
            letterSpacing: "0.04em",
          }}
        >
          © 2026 SCANMATE — Warehouse Operations Platform
        </footer>
      </div>
    </div>
  );
}
