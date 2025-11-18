import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";

/**
 * DashboardLayout.jsx
 * 
 * Provides a consistent layout for your admin dashboard.
 * Includes a collapsible sidebar, a top navigation bar, and a main content area.
 */
export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication token or flag
    localStorage.removeItem("authToken");
    // Navigate to login page
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Hamburger Menu Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          onMouseEnter={() => setIsSidebarOpen(true)}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Sliding Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r shadow-lg transform transition-transform duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="w-64 h-full flex flex-col">
          <div className="px-3 py-5 border-b">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="flex-1 flex flex-col p-3 space-y-2 overflow-y-auto">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              Home Page
            </Link>
            <Link
              to="/dashboard/places"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              Places
            </Link>
            <Link
              to="/dashboard/events"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/dashboard/restaurants"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              Restaurants
            </Link>
            <Link
              to="/dashboard/users"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              Users
            </Link>
            <Link
              to="/dashboard/native_products"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              Native Products
            </Link>
            <Link
              to="/dashboard/reviews"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              User Reviews
            </Link>
            <Link
              to="/dashboard/reports"
              className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              Problems Reports
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
          <h2 className="text-2xl font-bold ml-12">Yarl Wander Nest</h2>
          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-emerald-800 rounded hover:bg-emerald-1000 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {/* Outlet renders the child route component */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}