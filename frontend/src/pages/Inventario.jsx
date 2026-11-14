
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

const productoInicial = {
  id_categoria: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  precio_unitario: "",
  cantidad: "",
  stock_minimo: "",
  estado: true,
};

const categoriaInicial = {
  nombre: "",
  descripcion: "",
  estado: true,
};

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [criticos, setCriticos] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarCategoria, setMostrarCategoria] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [formulario, setFormulario] = useState(productoInicial);
  const [formCategoria, setFormCategoria] = useState(categoriaInicial);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [
        respuestaProductos,
        respuestaCategorias,
        respuestaCriticos,
        respuestaValor,
      ] = await Promise.all([
        API.get("/productos"),
        API.get("/categorias"),
        API.get("/inventario/criticos"),
        API.get("/inventario/valor-total"),
      ]);

      setProductos(
        (respuestaProductos.data.productos || []).filter(
          (producto) => producto.estado
        )
      );

      setCategorias(
        (respuestaCategorias.data.categorias || []).filter(
          (categoria) => categoria.estado
        )
      );

      setCriticos(respuestaCriticos.data.criticos || []);
      setValorTotal(respuestaValor.data.valor_total || 0);
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setError(
        err.response?.data?.detail ||
          "No fue posible cargar el inventario. Verifica la conexión con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosFiltrados = productos.filter((producto) => {
    const termino = busqueda.toLowerCase();

    return (
      (producto.nombre || "").toLowerCase().includes(termino) ||
      (producto.codigo || "").toLowerCase().includes(termino) ||
      (producto.categoria || "").toLowerCase().includes(termino)
    );
  });

  const abrirNuevoProducto = () => {
    setProductoEditando(null);
    setFormulario(productoInicial);
    setMostrarFormulario(true);
    setMensaje("");
    setError("");
  };

  const abrirEditarProducto = (producto) => {
    setProductoEditando(producto.id_producto);

    setFormulario({
      id_categoria: String(producto.id_categoria),
      codigo: producto.codigo || "",
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio_unitario: String(producto.precio_unitario ?? ""),
      cantidad: String(producto.cantidad ?? ""),
      stock_minimo: String(producto.stock_minimo ?? ""),
      estado: producto.estado,
    });

    setMostrarFormulario(true);
    setMensaje("");
    setError("");
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");

    if (!formulario.id_categoria) {
      setError("Selecciona una categoría.");
      setGuardando(false);
      return;
    }

    const datos = {
      id_categoria: Number(formulario.id_categoria),
      codigo: formulario.codigo.trim() || null,
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      precio_unitario: Number(formulario.precio_unitario),
      cantidad: Number(formulario.cantidad),
      stock_minimo: Number(formulario.stock_minimo),
      estado: true,
    };

    try {
      if (productoEditando) {
        await API.put(`/productos/${productoEditando}`, datos);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await API.post("/productos", datos);
        setMensaje("Producto registrado correctamente.");
      }

      setMostrarFormulario(false);
      setFormulario(productoInicial);
      setProductoEditando(null);

      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar producto:", err);
      setError(
        err.response?.data?.detail ||
          "No fue posible guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await API.post("/categorias", {
        nombre: formCategoria.nombre.trim(),
        descripcion: formCategoria.descripcion.trim() || null,
        estado: true,
      });

      setMensaje("Categoría registrada correctamente.");
      setFormCategoria(categoriaInicial);
      setMostrarCategoria(false);

      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      setError(
        err.response?.data?.detail ||
          "No fue posible registrar la categoría."
      );
    } finally {
      setGuardando(false);
    }
  };

  const desactivarProducto = async (producto) => {
    const confirmar = window.confirm(
      `¿Deseas desactivar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");

    try {
      await API.delete(`/productos/${producto.id_producto}`);
      setMensaje("Producto desactivado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error("Error al desactivar producto:", err);
      setError(
        err.response?.data?.detail ||
          "No fue posible desactivar el producto."
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* ENCABEZADO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-forest-green-800">
              Inventario
            </h1>
            <p className="text-sage-green-600 mt-1">
              Administra los productos y existencias de Pétalo & Aroma.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setMostrarCategoria(true);
                setError("");
                setMensaje("");
              }}
              className="px-4 py-2.5 rounded-lg border border-forest-green-700 text-forest-green-800 hover:bg-beige-100 font-medium transition"
            >
              + Nueva categoría
            </button>

            <button
              onClick={abrirNuevoProducto}
              className="px-4 py-2.5 rounded-lg bg-forest-green-800 text-white hover:bg-forest-green-700 font-medium transition"
            >
              + Nuevo producto
            </button>
          </div>
        </div>

        {/* MENSAJES */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {mensaje}
          </div>
        )}

        {/* INDICADORES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-beige-200 shadow-sm p-5">
            <p className="text-sm text-sage-green-600">Productos activos</p>
            <p className="text-3xl font-bold text-forest-green-800 mt-2">
              {productos.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-beige-200 shadow-sm p-5">
            <p className="text-sm text-sage-green-600">Categorías activas</p>
            <p className="text-3xl font-bold text-forest-green-800 mt-2">
              {categorias.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-beige-200 shadow-sm p-5">
            <p className="text-sm text-sage-green-600">Stock crítico</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {criticos.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-beige-200 shadow-sm p-5">
            <p className="text-sm text-sage-green-600">
              Valor del inventario
            </p>
            <p className="text-2xl font-bold text-forest-green-800 mt-2">
              {formatoPrecio(valorTotal)}
            </p>
          </div>
        </div>

        {/* ALERTA DE STOCK */}
        {criticos.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h2 className="font-semibold text-amber-900">
              Atención: productos con stock crítico
            </h2>
            <p className="text-sm text-amber-800 mt-1">
              Hay {criticos.length} producto(s) por debajo del stock mínimo
              establecido.
            </p>
          </div>
        )}

        {/* TABLA DE PRODUCTOS */}
        <div className="bg-white rounded-xl border border-beige-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-beige-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-forest-green-800">
                Productos registrados
              </h2>
              <p className="text-sm text-sage-green-600 mt-1">
                Consulta y administra las existencias.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto o categoría..."
                className="w-full sm:w-64 px-3 py-2 border border-beige-300 rounded-lg outline-none focus:ring-2 focus:ring-sage-green-400"
              />

              <button
                onClick={cargarDatos}
                className="px-3 py-2 border border-beige-300 rounded-lg text-forest-green-800 hover:bg-beige-100"
                title="Actualizar inventario"
              >
                ↻
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="p-10 text-center text-sage-green-600">
              Cargando inventario...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl mb-3">🌿</div>
              <h3 className="font-semibold text-forest-green-800">
                {productos.length === 0
                  ? "Todavía no hay productos registrados"
                  : "No se encontraron resultados"}
              </h3>
              <p className="text-sm text-sage-green-600 mt-2">
                {productos.length === 0
                  ? "Registra categorías y productos para comenzar a gestionar tu inventario."
                  : "Intenta buscar con otro nombre o código."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-beige-100 text-forest-green-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 font-semibold">Precio</th>
                    <th className="px-4 py-3 font-semibold">Cantidad</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-beige-200">
                  {productosFiltrados.map((producto) => {
                    const stockBajo =
                      Number(producto.cantidad) <
                      Number(producto.stock_minimo);

                    return (
                      <tr
                        key={producto.id_producto}
                        className="hover:bg-beige-50 transition"
                      >
                        <td className="px-4 py-3 text-sage-green-700">
                          {producto.codigo || "—"}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-forest-green-800">
                            {producto.nombre}
                          </p>
                          <p className="text-xs text-sage-green-600 mt-1">
                            {producto.descripcion || "Sin descripción"}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-sage-green-700">
                          {producto.categoria || "Sin categoría"}
                        </td>

                        <td className="px-4 py-3 text-forest-green-800 font-medium">
                          {formatoPrecio(producto.precio_unitario)}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={
                              stockBajo
                                ? "text-red-600 font-semibold"
                                : "text-forest-green-800"
                            }
                          >
                            {producto.cantidad}
                          </span>
                          <p className="text-xs text-sage-green-600">
                            Mínimo: {producto.stock_minimo}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              stockBajo
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {stockBajo ? "Stock bajo" : "Disponible"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => abrirEditarProducto(producto)}
                              className="text-forest-green-800 hover:underline font-medium"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => desactivarProducto(producto)}
                              className="text-red-600 hover:underline font-medium"
                            >
                              Desactivar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FORMULARIO DE PRODUCTO */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto">
            <div className="p-5 border-b border-beige-200 flex justify-between items-center">
              <div>
                <h2 className="font-display text-xl font-bold text-forest-green-800">
                  {productoEditando ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p className="text-sm text-sage-green-600 mt-1">
                  Completa la información del producto.
                </p>
              </div>

              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-sage-green-600 hover:text-forest-green-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarProducto} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-green-800 mb-1">
                  Nombre del producto *
                </label>
                <input
                  required
                  maxLength={100}
                  value={formulario.nombre}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      nombre: e.target.value,
                    })
                  }
                  className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                  placeholder="Ej. Ramo de rosas"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-green-800 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formulario.id_categoria}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        id_categoria: e.target.value,
                      })
                    }
                    className="w-full border border-beige-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-sage-green-400"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((categoria) => (
                      <option
                        key={categoria.id_categoria}
                        value={categoria.id_categoria}
                      >
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>

                  {categorias.length === 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      Primero debes registrar una categoría.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest-green-800 mb-1">
                    Código
                  </label>
                  <input
                    maxLength={20}
                    value={formulario.codigo}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        codigo: e.target.value,
                      })
                    }
                    className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                    placeholder="Ej. FLO-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-green-800 mb-1">
                  Descripción
                </label>
                <textarea
                  maxLength={255}
                  rows={2}
                  value={formulario.descripcion}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-green-800 mb-1">
                    Precio unitario *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.precio_unitario}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        precio_unitario: e.target.value,
                      })
                    }
                    className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest-green-800 mb-1">
                    Cantidad *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={formulario.cantidad}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        cantidad: e.target.value,
                      })
                    }
                    className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest-green-800 mb-1">
                    Stock mínimo *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={formulario.stock_minimo}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        stock_minimo: e.target.value,
                      })
                    }
                    className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                    placeholder="0"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-4 py-2 rounded-lg border border-beige-300 text-forest-green-800 hover:bg-beige-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando || categorias.length === 0}
                  className="px-5 py-2 rounded-lg bg-forest-green-800 text-white hover:bg-forest-green-700 disabled:opacity-50"
                >
                  {guardando
                    ? "Guardando..."
                    : productoEditando
                    ? "Guardar cambios"
                    : "Registrar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORMULARIO DE CATEGORÍA */}
      {mostrarCategoria && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-beige-200 flex justify-between items-center">
              <h2 className="font-display text-xl font-bold text-forest-green-800">
                Nueva categoría
              </h2>

              <button
                onClick={() => setMostrarCategoria(false)}
                className="text-sage-green-600 hover:text-forest-green-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarCategoria} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-green-800 mb-1">
                  Nombre de la categoría *
                </label>
                <input
                  required
                  maxLength={50}
                  value={formCategoria.nombre}
                  onChange={(e) =>
                    setFormCategoria({
                      ...formCategoria,
                      nombre: e.target.value,
                    })
                  }
                  className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                  placeholder="Ej. Arreglos florales"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-green-800 mb-1">
                  Descripción
                </label>
                <textarea
                  maxLength={255}
                  rows={3}
                  value={formCategoria.descripcion}
                  onChange={(e) =>
                    setFormCategoria({
                      ...formCategoria,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full border border-beige-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-sage-green-400"
                  placeholder="Describe esta categoría..."
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarCategoria(false)}
                  className="px-4 py-2 rounded-lg border border-beige-300 text-forest-green-800 hover:bg-beige-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-lg bg-forest-green-800 text-white hover:bg-forest-green-700 disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Registrar categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
