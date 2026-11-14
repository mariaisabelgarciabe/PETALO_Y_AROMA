
import React from "react";
import Layout from "../components/Layout";

export default function AcercaDelProyecto() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-forest-green-800">
          Acerca del proyecto
        </h1>
        <p className="mt-2 text-sage-green-600">
          Conoce más sobre PÉTALO & AROMA y el equipo detrás de su desarrollo.
        </p>
      </div>

      <section className="mb-6 rounded-2xl border border-beige-200 bg-white p-8 shadow-sm">
        <div className="mb-5 text-center">
          <span className="text-5xl">🌷</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-forest-green-800">
            PÉTALO & AROMA
          </h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-sage-green-600">
            Sistema de gestión de floristería
          </p>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <p className="leading-7 text-gray-600">
            PÉTALO & AROMA es un sistema de gestión diseñado para facilitar la
            administración de una floristería, permitiendo organizar el
            inventario, gestionar productos y categorías, registrar clientes,
            controlar las ventas y consultar el historial de transacciones.
          </p>
          <p className="mt-4 leading-7 text-gray-600">
            Su propósito es centralizar la información del negocio, mejorar
            el control de los productos disponibles y apoyar los procesos
            administrativos mediante una herramienta digital.
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-beige-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 font-display text-2xl font-bold text-forest-green-800">
          Equipo de desarrollo
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            "María Isabel García Berrío",
            "Luz Ángela Vargas Restán",
            "Juan Diego Tangarife Pérez",
          ].map((integrante, index) => (
            <div
              key={index}
              className="rounded-xl bg-beige-50 p-5 text-center"
            >
              <div className="mb-3 text-3xl">👤</div>
              <p className="font-semibold text-forest-green-800">
                {integrante}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-beige-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 font-display text-2xl font-bold text-forest-green-800">
          Información académica
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-sage-green-600">Institución</p>
            <p className="mt-1 font-semibold text-gray-800">
              Institución Universitaria de Envigado (IUE)
            </p>
          </div>

          <div>
            <p className="text-sm text-sage-green-600">Programa académico</p>
            <p className="mt-1 font-semibold text-gray-800">
              Ingeniería Informática
            </p>
          </div>

          <div>
            <p className="text-sm text-sage-green-600">Asignatura</p>
            <p className="mt-1 font-semibold text-gray-800">
              Estructura de Datos
            </p>
          </div>

          <div>
            <p className="text-sm text-sage-green-600">Semestre</p>
            <p className="mt-1 font-semibold text-gray-800">
              Cuarto semestre
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
