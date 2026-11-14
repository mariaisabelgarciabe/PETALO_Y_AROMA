
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Reportes from "./pages/Reportes";
import AcercaDelProyecto from "./pages/AcercaDelProyecto";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route
          path="/acerca-del-proyecto"
          element={<AcercaDelProyecto />}
        />
      </Routes>
    </BrowserRouter>
  );
}
