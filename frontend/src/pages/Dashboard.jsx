import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { getHealth } from "../services/api";

export default function Dashboard() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ status: "error", database: "unavailable" }));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-forest-green-800">
          Dashboard
        </h1>
        <p className="text-sage-green-600 mt-1">
          Resumen general del sistema de PÉTALO & AROMA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Estado API" value={health?.status === "ok" ? "Activo" : "Conectando..."} subtitle={health?.database === "connected" ? "BD conectada" : "BD no disponible"} icon="🌸" accent="forest" />
        <Card title="Inventario" value="--" subtitle="Prod. registrados" icon="📦" accent="sage" />
        <Card title="Ventas del mes" value="--" subtitle="Total vendido" icon="💰" accent="beige" />
        <Card title="Stock crítico" value="--" subtitle="Prod. < 5 und." icon="⚠️" accent="sage" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-beige-200 p-6">
        <h2 className="font-display text-xl font-semibold text-forest-green-700 mb-4">
          Bienvenidos al sistema
        </h2>
        <p className="text-sage-green-600 leading-relaxed">
          Esta es la versión inicial del sistema de gestión para la floristería
          PÉTALO & AROMA. Desde las secciones de inventario, ventas y reportes
          podrás administrar productos, clientes, ventas y generar informes.
        </p>
        <div className="mt-4 flex gap-3">
          <span className="inline-block bg-forest-green-100 text-forest-green-700 text-xs font-medium px-3 py-1 rounded-full">
            Frontend: React + Vite + Tailwind
          </span>
          <span className="inline-block bg-sage-green-100 text-sage-green-700 text-xs font-medium px-3 py-1 rounded-full">
            Backend: FastAPI
          </span>
        </div>
      </div>
    </Layout>
  );
}