
import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { to: "/", label: "Dashboard", icon: "🌸" },
  { to: "/inventario", label: "Inventario", icon: "📦" },
  { to: "/ventas", label: "Ventas", icon: "💰" },
  { to: "/reportes", label: "Reportes", icon: "📊" },
  {
    to: "/acerca-del-proyecto",
    label: "Acerca del proyecto",
    icon: "ℹ️",
  },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-forest-green-500 text-beige-50 flex flex-col">
        <div className="p-6 border-b border-forest-green-600">
          <h1 className="font-display text-2xl font-bold">
            PÉTALO & AROMA
          </h1>
          <p className="text-sage-green-300 text-sm">Floristería</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-sage-green-500 text-white shadow"
                    : "text-beige-100 hover:bg-forest-green-600"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-forest-green-600 text-xs text-sage-green-300">
          v0.1.0 — MVP
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-beige-50 overflow-auto">
        <header className="bg-white shadow-sm border-b border-beige-200 px-8 py-4">
          <h2 className="font-display text-2xl font-semibold text-forest-green-700">
            Sistema de Gestión de Floristería
          </h2>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
