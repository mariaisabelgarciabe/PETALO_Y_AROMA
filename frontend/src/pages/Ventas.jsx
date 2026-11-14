
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const formatoCOP = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

export default function Ventas() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [mostrarCliente, setMostrarCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    direccion: "",
  });

  const [idCliente, setIdCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [detalles, setDetalles] = useState([]);

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [respuestaClientes, respuestaProductos, respuestaVentas] =
        await Promise.all([
          API.get("/clientes"),
          API.get("/productos"),
          API.get("/ventas"),
        ]);

      setClientes(respuestaClientes.data.clientes || []);
      setProductos(respuestaProductos.data.productos || []);
      setVentas(respuestaVentas.data.ventas || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "No fue posible cargar la información. Verifica que el backend esté activo."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosDisponibles = productos.filter(
    (producto) =>
      producto.estado !== false &&
      producto.estado !== 0 &&
      Number(producto.cantidad) > 0
  );

  const agregarProducto = () => {
    setError("");
    setMensaje("");

    const producto = productosDisponibles.find(
      (item) => String(item.id_producto) === String(idProducto)
    );

    if (!producto) {
      setError("Selecciona un producto disponible.");
      return;
    }

    const cantidadSolicitada = Number(cantidad);

    if (
      !Number.isInteger(cantidadSolicitada) ||
      cantidadSolicitada < 1
    ) {
      setError("La cantidad debe ser un número entero mayor que cero.");
      return;
    }

    const cantidadEnLista = detalles
      .filter((item) => item.id_producto === producto.id_producto)
      .reduce((total, item) => total + item.cantidad, 0);

    if (cantidadEnLista + cantidadSolicitada > Number(producto.cantidad)) {
      setError(
        `Solo hay ${producto.cantidad} unidades disponibles de ${producto.nombre}.`
      );
      return;
    }

    const existente = detalles.find(
      (item) => item.id_producto === producto.id_producto
    );

    if (existente) {
      setDetalles(
        detalles.map((item) =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + cantidadSolicitada }
            : item
        )
      );
    } else {
      setDetalles([
        ...detalles,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio_unitario: Number(producto.precio_unitario),
          cantidad: cantidadSolicitada,
        },
      ]);
    }

    setIdProducto("");
    setCantidad(1);
  };

  const quitarProducto = (id) => {
    setDetalles(detalles.filter((item) => item.id_producto !== id));
  };

  const totalVenta = detalles.reduce(
    (total, item) =>
      total + item.precio_unitario * item.cantidad,
    0
  );

  const registrarCliente = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    try {
      const respuesta = await API.post("/clientes", nuevoCliente);

      setClientes([...clientes, respuesta.data]);
      setIdCliente(String(respuesta.data.id_cliente));
      setNuevoCliente({
        nombres: "",
        apellidos: "",
        telefono: "",
        correo: "",
        direccion: "",
      });
      setMostrarCliente(false);
      setMensaje("Cliente registrado correctamente.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "No fue posible registrar el cliente."
      );
    }
  };

  const registrarVenta = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (detalles.length === 0) {
      setError("Agrega al menos un producto a la venta.");
      return;
    }

    setGuardando(true);

    try {
      await API.post("/ventas", {
        id_cliente: idCliente ? Number(idCliente) : null,
        metodo_pago: metodoPago,
        detalles: detalles.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
        })),
      });

      setDetalles([]);
      setIdCliente("");
      setMetodoPago("Efectivo");
      setMensaje("Venta registrada correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "No fue posible registrar la venta. Verifica las existencias."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-green-800">
            Ventas
          </h1>
          <p className="text-sage-green-600 mt-1">
            Registro de ventas, clientes e historial de transacciones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarCliente(!mostrarCliente)}
          className="rounded-lg bg-forest-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-green-800"
        >
          + Nuevo cliente
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {mostrarCliente && (
        <section className="mb-6 rounded-xl border border-beige-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold text-forest-green-800">
            Registrar cliente
          </h2>

          <form onSubmit={registrarCliente}>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["nombres", "Nombres", true],
                ["apellidos", "Apellidos", true],
                ["telefono", "Teléfono", false],
                ["correo", "Correo electrónico", false],
                ["direccion", "Dirección", false],
              ].map(([campo, etiqueta, requerido]) => (
                <label key={campo} className="text-sm font-medium text-gray-700">
                  {etiqueta}
                  <input
                    type="text"
                    required={requerido}
                    value={nuevoCliente[campo]}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        [campo]: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-beige-300 px-3 py-2 outline-none focus:border-forest-green-600"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-forest-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-forest-green-800"
              >
                Guardar cliente
              </button>
              <button
                type="button"
                onClick={() => setMostrarCliente(false)}
                className="rounded-lg border border-beige-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-6 rounded-xl border border-beige-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-display text-xl font-bold text-forest-green-800">
          Registrar venta
        </h2>

        <form onSubmit={registrarVenta}>
          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Cliente
              <select
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value)}
                className="mt-1 w-full rounded-lg border border-beige-300 bg-white px-3 py-2"
              >
                <option value="">Venta sin cliente registrado</option>
                {clientes.map((cliente) => (
                  <option
                    key={cliente.id_cliente}
                    value={cliente.id_cliente}
                  >
                    {cliente.nombres} {cliente.apellidos || ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-gray-700">
              Método de pago
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="mt-1 w-full rounded-lg border border-beige-300 bg-white px-3 py-2"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </label>
          </div>

          <div className="mb-5 rounded-lg bg-beige-50 p-4">
            <h3 className="mb-3 font-semibold text-forest-green-800">
              Productos
            </h3>

            <div className="grid items-end gap-3 md:grid-cols-[1fr_120px_auto]">
              <label className="text-sm text-gray-700">
                Seleccionar producto
                <select
                  value={idProducto}
                  onChange={(e) => setIdProducto(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-beige-300 bg-white px-3 py-2"
                >
                  <option value="">Selecciona un producto</option>
                  {productosDisponibles.map((producto) => (
                    <option
                      key={producto.id_producto}
                      value={producto.id_producto}
                    >
                      {producto.nombre} — {formatoCOP(producto.precio_unitario)} 
                      {" "} (Stock: {producto.cantidad})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-700">
                Cantidad
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-beige-300 bg-white px-3 py-2"
                />
              </label>

              <button
                type="button"
                onClick={agregarProducto}
                disabled={productosDisponibles.length === 0}
                className="rounded-lg bg-forest-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Agregar
              </button>
            </div>

            {detalles.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-beige-200 text-sage-green-700">
                    <tr>
                      <th className="py-2">Producto</th>
                      <th className="py-2">Precio</th>
                      <th className="py-2">Cantidad</th>
                      <th className="py-2">Subtotal</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((item) => (
                      <tr key={item.id_producto} className="border-b border-beige-100">
                        <td className="py-3">{item.nombre}</td>
                        <td className="py-3">{formatoCOP(item.precio_unitario)}</td>
                        <td className="py-3">{item.cantidad}</td>
                        <td className="py-3 font-medium">
                          {formatoCOP(item.precio_unitario * item.cantidad)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => quitarProducto(item.id_producto)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-sage-green-600">Total de la venta</p>
              <p className="font-display text-2xl font-bold text-forest-green-800">
                {formatoCOP(totalVenta)}
              </p>
            </div>

            <button
              type="submit"
              disabled={guardando || detalles.length === 0}
              className="rounded-lg bg-forest-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-forest-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando ? "Registrando..." : "Registrar venta"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-beige-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-xl font-bold text-forest-green-800">
          Historial de ventas
        </h2>

        {cargando ? (
          <p className="py-6 text-center text-sage-green-600">
            Cargando información...
          </p>
        ) : ventas.length === 0 ? (
          <p className="py-6 text-center text-sage-green-600">
            Todavía no hay ventas registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-beige-200 text-sage-green-700">
                <tr>
                  <th className="py-3">N.º</th>
                  <th className="py-3">Cliente</th>
                  <th className="py-3">Fecha</th>
                  <th className="py-3">Método de pago</th>
                  <th className="py-3">Total</th>
                  <th className="py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id_venta} className="border-b border-beige-100">
                    <td className="py-3">#{venta.id_venta}</td>
                    <td className="py-3">
                      {venta.nombres
                        ? `${venta.nombres} ${venta.apellidos || ""}`
                        : "Cliente no registrado"}
                    </td>
                    <td className="py-3">
                      {venta.fecha_venta
                        ? new Date(venta.fecha_venta).toLocaleDateString("es-CO")
                        : "—"}
                    </td>
                    <td className="py-3">{venta.metodo_pago || "—"}</td>
                    <td className="py-3 font-medium">
                      {formatoCOP(venta.total)}
                    </td>
                    <td className="py-3">{venta.estado || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
