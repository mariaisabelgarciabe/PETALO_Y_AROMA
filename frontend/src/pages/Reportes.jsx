import React from "react";
import Layout from "../components/Layout";

export default function Reportes() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-forest-green-800">
          Reportes
        </h1>
        <p className="text-sage-green-600 mt-1">
          Gráficas y exportación de datos
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-beige-200 p-8 text-center">
        <span className="text-5xl">📊</span>
        <p className="mt-4 text-sage-green-600">
          Funcionalidad en desarrollo. Próximamente podrás generar las seis
          gráficas y exportar los registros a Excel.
        </p>
      </div>
    </Layout>
  );
}