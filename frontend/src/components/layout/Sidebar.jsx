import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { menu } from "../../config/menuData";
import { useAuthStore } from "../../store/authStore";
import { hasModule } from "../../utils/permissions";

const ICONS = {
  Dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Inventorization: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  Transfer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    </svg>
  ),
  Receive: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29"/>
    </svg>
  ),
  Sales: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  Report: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
};

function findActiveGroup(pathname) {
  const item = menu.find(
    (entry) => entry.children && entry.children.some((child) => pathname.startsWith(child.path)),
  );
  return item?.name || null;
}

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState(() => findActiveGroup(location.pathname));
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const activeGroup = findActiveGroup(location.pathname);
    if (activeGroup) setOpenGroup(activeGroup);
  }, [location.pathname]);

  function toggleGroup(name) {
    setOpenGroup((current) => (current === name ? null : name));
  }

  return (
    <aside
      className="glass-sidebar sticky left-0 top-0 h-screen flex flex-col z-30 transition-all duration-300 overflow-hidden"
      style={{
        width: isOpen ? "var(--sidebar-width)" : "0",
        minWidth: isOpen ? "var(--sidebar-width)" : "0",
      }}
    >
      <div className="flex flex-col h-full" style={{ width: "var(--sidebar-width)" }}>
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--glass-border)" }}
        >
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)",
                boxShadow: "0 0 16px var(--accent-cyan-glow)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest" style={{ color: "var(--text-primary)", lineHeight: 1 }}>
                SCANMATE
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.1em", marginTop: "2px" }}>
                ADMIN CONSOLE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: "none" }}>
          <div className="space-y-0.5">
            {menu
              .filter((item) => !item.module || hasModule(user, item.module))
              .map((item) => {
                if (item.children) {
                  const isExpanded = openGroup === item.name;
                  const isParentActive =
                    location.pathname === item.path ||
                    item.children.some((child) => location.pathname.startsWith(child.path));

                  return (
                    <div key={item.name}>
                      <button
                        className={`nav-group-btn ${isParentActive ? "parent-active" : ""}`}
                        onClick={() => toggleGroup(item.name)}
                      >
                        <span className="flex items-center gap-2.5">
                          <span style={{ opacity: 0.7, flexShrink: 0 }}>
                            {ICONS[item.name]}
                          </span>
                          <span>{item.name}</span>
                        </span>
                        <svg
                          width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          style={{
                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 200ms ease",
                            flexShrink: 0,
                          }}
                        >
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="mt-0.5 space-y-0.5 pl-1">
                          {item.children
                            .filter((child) => !child.module || hasModule(user, child.module))
                            .map((child) => (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                className={({ isActive }) => `nav-child ${isActive ? "active" : ""}`}
                              >
                                {child.name}
                              </NavLink>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                }

                if (!item.path) return null;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  >
                    <span style={{ opacity: 0.7, flexShrink: 0 }}>
                      {ICONS[item.name]}
                    </span>
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
          </div>
        </nav>

        {/* Bottom user hint */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", letterSpacing: "0.04em" }}>
            Signed in as{" "}
            <span style={{ color: "var(--text-secondary)" }}>{user?.username}</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
