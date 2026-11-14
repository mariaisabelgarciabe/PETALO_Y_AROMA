
"""
Servicio de clientes y ventas.
Conexión a SQL Server - Base de datos PETALO_AROMA.
"""

from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.orm import Session


# =========================================================
# CLIENTES
# =========================================================

def list_clientes(db: Session) -> list[dict]:
    """Lista los clientes registrados."""

    sql = """
        SELECT
            id_cliente,
            nombres,
            apellidos,
            telefono,
            correo,
            direccion,
            fecha_registro
        FROM dbo.CLIENTE
        ORDER BY nombres, apellidos
    """

    rows = db.execute(text(sql)).fetchall()

    return [dict(row._mapping) for row in rows]


def create_cliente(db: Session, data: dict) -> dict:
    """Registra un cliente."""

    nombres = data["nombres"].strip()

    if not nombres:
        raise ValueError("Los nombres del cliente son obligatorios.")

    sql = """
        INSERT INTO dbo.CLIENTE (
            nombres,
            apellidos,
            telefono,
            correo,
            direccion
        )
        OUTPUT
            INSERTED.id_cliente,
            INSERTED.nombres,
            INSERTED.apellidos,
            INSERTED.telefono,
            INSERTED.correo,
            INSERTED.direccion,
            INSERTED.fecha_registro
        VALUES (
            :nombres,
            :apellidos,
            :telefono,
            :correo,
            :direccion
        )
    """

    datos = {
        "nombres": nombres,
        "apellidos": data.get("apellidos"),
        "telefono": data.get("telefono"),
        "correo": data.get("correo"),
        "direccion": data.get("direccion")
    }

    try:
        result = db.execute(text(sql), datos)
        cliente = dict(result.fetchone()._mapping)
        db.commit()

        return cliente

    except Exception:
        db.rollback()
        raise


# =========================================================
# CONSULTA DE VENTAS
# =========================================================

def list_ventas(db: Session) -> list[dict]:
    """Lista las ventas con el nombre del cliente."""

    sql = """
        SELECT
            V.id_venta,
            V.id_cliente,
            V.fecha_venta,
            V.metodo_pago,
            V.total,
            V.estado,
            C.nombres,
            C.apellidos
        FROM dbo.VENTA V
        LEFT JOIN dbo.CLIENTE C
            ON V.id_cliente = C.id_cliente
        ORDER BY V.fecha_venta DESC
    """

    rows = db.execute(text(sql)).fetchall()

    return [dict(row._mapping) for row in rows]


# =========================================================
# REGISTRO DE VENTAS
# =========================================================

def create_venta(db: Session, data: dict) -> dict:
    """
    Registra una venta, sus detalles y los movimientos
    de salida del inventario en una sola transacción.
    """

    detalles = data.get("detalles", [])

    if not detalles:
        raise ValueError("La venta debe contener al menos un producto.")

    try:
        id_cliente = data.get("id_cliente")

        # Validar cliente cuando se selecciona uno.
        if id_cliente is not None:
            cliente = db.execute(
                text("""
                    SELECT id_cliente
                    FROM dbo.CLIENTE
                    WHERE id_cliente = :id_cliente
                """),
                {"id_cliente": id_cliente}
            ).fetchone()

            if cliente is None:
                raise ValueError("El cliente seleccionado no existe.")

        # Validar productos y calcular sus valores.
        productos_venta = []
        total = Decimal("0")

        for detalle in detalles:
            id_producto = detalle["id_producto"]
            cantidad = detalle["cantidad"]

            if cantidad < 1:
                raise ValueError("La cantidad debe ser mayor que cero.")

            producto = db.execute(
                text("""
                    SELECT
                        id_producto,
                        nombre,
                        precio_unitario,
                        cantidad,
                        estado
                    FROM dbo.PRODUCTO WITH (UPDLOCK, ROWLOCK)
                    WHERE id_producto = :id_producto
                """),
                {"id_producto": id_producto}
            ).fetchone()

            if producto is None:
                raise ValueError(
                    f"El producto con ID {id_producto} no existe."
                )

            if not producto.estado:
                raise ValueError(
                    f"El producto {producto.nombre} está inactivo."
                )

            if producto.cantidad < cantidad:
                raise ValueError(
                    f"Existencias insuficientes para {producto.nombre}. "
                    f"Disponibles: {producto.cantidad}."
                )

            precio = Decimal(str(producto.precio_unitario))
            subtotal = precio * cantidad
            total += subtotal

            productos_venta.append({
                "id_producto": id_producto,
                "nombre": producto.nombre,
                "cantidad": cantidad,
                "precio_unitario": precio,
                "subtotal": subtotal
            })

        # Crear la venta.
        result = db.execute(
            text("""
                INSERT INTO dbo.VENTA (
                    id_cliente,
                    metodo_pago,
                    total
                )
                OUTPUT INSERTED.id_venta
                VALUES (
                    :id_cliente,
                    :metodo_pago,
                    :total
                )
            """),
            {
                "id_cliente": id_cliente,
                "metodo_pago": data.get("metodo_pago"),
                "total": total
            }
        )

        id_venta = result.scalar_one()

        # Registrar detalles y descontar existencias.
        for producto in productos_venta:

            db.execute(
                text("""
                    INSERT INTO dbo.DETALLE_VENTA (
                        id_venta,
                        id_producto,
                        cantidad,
                        precio_unitario
                    )
                    VALUES (
                        :id_venta,
                        :id_producto,
                        :cantidad,
                        :precio_unitario
                    )
                """),
                {
                    "id_venta": id_venta,
                    "id_producto": producto["id_producto"],
                    "cantidad": producto["cantidad"],
                    "precio_unitario": producto["precio_unitario"]
                }
            )

            actualizacion = db.execute(
                text("""
                    UPDATE dbo.PRODUCTO
                    SET cantidad = cantidad - :cantidad
                    WHERE id_producto = :id_producto
                      AND cantidad >= :cantidad
                      AND estado = 1
                """),
                {
                    "id_producto": producto["id_producto"],
                    "cantidad": producto["cantidad"]
                }
            )

            if actualizacion.rowcount != 1:
                raise ValueError(
                    f"No fue posible actualizar el inventario de "
                    f"{producto['nombre']}."
                )

            db.execute(
                text("""
                    INSERT INTO dbo.MOVIMIENTO_INVENTARIO (
                        id_producto,
                        tipo_movimiento,
                        cantidad,
                        observacion,
                        id_venta
                    )
                    VALUES (
                        :id_producto,
                        'SALIDA',
                        :cantidad,
                        :observacion,
                        :id_venta
                    )
                """),
                {
                    "id_producto": producto["id_producto"],
                    "cantidad": producto["cantidad"],
                    "observacion": "Salida por venta",
                    "id_venta": id_venta
                }
            )

        db.commit()

        return {
            "id_venta": id_venta,
            "id_cliente": id_cliente,
            "total": float(total),
            "estado": "COMPLETADA",
            "productos": productos_venta
        }

    except Exception:
        db.rollback()
        raise
