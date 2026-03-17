// frontend/src/components/layout/Layout.jsx

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import WarehouseSelector from "./WarehouseSelector";
import { useAuthStore } from "../../store/authStore";
import { PATHS } from "../../app/paths";

export default function Layout() {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogOut = () => {
    logout();
    navigate(PATHS.LOGIN, { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1">
        {/* Sticky Topbar */}
        <div className="sticky top-0 z-20 bg-white border-b py-3 flex items-center gap-3">
          <div className="relative w-full flex items-center justify-between ps-12 pe-5">
            <div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`
                absolute -left-100 -top-2  ms-1 px-3 py-2 flex flex-col items-center justify-center gap-1 
                bg-sky-200/80 text-gray-700 rounded transition-all duration-200 cursor-pointer 
                 group
                ${!sidebarOpen ? "translate-x-100" : ""}`}
              >
                <div className="h-1 w-4 bg-sky-700 group-hover:bg-sky-400 transition-all duration-500"></div>
                <div className="h-1 w-4 bg-sky-700 group-hover:bg-sky-400 transition-all duration-300"></div>
                <div className="h-1 w-4 bg-sky-700 group-hover:bg-sky-400 transition-all duration-100"></div>
              </button>

              <span className="font-semibold">Admin Panel</span>
            </div>
            <div className="flex items-center gap-3">
              <WarehouseSelector />

              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role?.name})
              </span>

              <button onClick={handleLogOut}>Logout</button>
            </div>
          </div>
        </div>

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
