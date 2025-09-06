import React from "react";
import { Link, Outlet } from "react-router-dom";

/**
 * DashboardLayout.jsx
 * 
 * Provides a consistent layout for your admin dashboard.
 * Includes a sidebar, a top navigation bar, and a main content area.
 */
export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2"
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard/places"
            className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2"
          >
            Places
          </Link>
          <Link
            to="/dashboard/events"
            className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2"
          >
            Events
          </Link>
          <Link
            to="/dashboard/restaurants"
            className="text-gray-700 hover:bg-gray-100 rounded px-3 py-2"
          >
            Restaurants
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <button
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => {
              // TODO: handle logout
              console.log("Logging out...");
            }}
          >
            Logout
          </button>
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
