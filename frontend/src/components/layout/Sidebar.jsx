import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { menu } from "../../config/menuData";
import { useAuthStore } from "../../store/authStore";
import { hasModule } from "../../utils/permissions";

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
    if (activeGroup) {
      setOpenGroup(activeGroup);
    }
  }, [location.pathname]);

  function toggleGroup(name) {
    setOpenGroup((current) => (current === name ? null : name));
  }

  return (
    <aside
      className={`
        sticky left-0 top-0 h-screen bg-sky-600 text-white
        transition-all duration-300 overflow-y-auto
        ${isOpen ? "w-64" : "w-0 p-0 overflow-hidden"}
      `}
    >
      <div className="relative">
        <div className="sticky top-0 flex items-center justify-between mb-6 py-2.5 px-5 bg-sky-600 border-b">
          <h2 className="text-xl font-bold">Admin</h2>

          <button
            onClick={onClose}
            className="text-gray-100 bg-gray-50/20 px-2 hover:text-white text-lg group cursor-pointer"
          >
            <span className="inline-block transition-transform duration-200 group-hover:rotate-90">
              ✕
            </span>
          </button>
        </div>

        <nav className="space-y-2 px-5 pb-6">
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
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded transition ${
                        isParentActive
                          ? "bg-white text-sky-700 font-semibold"
                          : "hover:bg-white/20"
                      }`}
                    >
                      <NavLink to={item.path} className="flex-1">
                        {item.name}
                      </NavLink>

                      <button onClick={() => toggleGroup(item.name)} className="ml-2">
                        <span
                          className={`inline-block transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        >
                          ▶
                        </span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-1 ml-3 space-y-1">
                        {item.children
                          .filter((child) => !child.module || hasModule(user, child.module))
                          .map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded transition ${
                                  isActive
                                    ? "bg-white text-sky-700 font-semibold"
                                    : "hover:bg-white/20"
                                }`
                              }
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
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded transition ${
                      isActive
                        ? "bg-white text-sky-700 font-semibold"
                        : "hover:bg-white/20"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              );
            })}
        </nav>
      </div>
    </aside>
  );
}
