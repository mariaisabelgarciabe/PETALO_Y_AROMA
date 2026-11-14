
"""
Servicio de inventario: lógica de negocio para productos y categorías.
Conexión a SQL Server - Base de datos PETALO_AROMA.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def _row_to_dict(row) -> dict:
    return dict(row._mapping)


# =========================================================
# CATEGORÍAS
# =========================================================

def _load_categorias(db: Session) -> dict[int, str]:
    sql = """
        SELECT id_categoria, nombre
        FROM dbo.CATEGORIA
    """

    rows = db.execute(text(sql)).fetchall()

    return {
        row._mapping["id_categoria"]: row._mapping["nombre"]
        for row in rows
    }


def list_categorias(db: Session) -> list[dict]:
    """Lista las categorías registradas."""

    sql = """
        SELECT
            id_categoria,
            nombre,
            descripcion,
            estado
        FROM dbo.CATEGORIA
        ORDER BY nombre
    """

    rows = db.execute(text(sql)).fetchall()

    return [_row_to_dict(row) for row in rows]


def create_categoria(db: Session, data: dict) -> dict:
    """Registra una nueva categoría y evita nombres duplicados."""

    nombre = data["nombre"].strip()

    if not nombre:
        raise ValueError("El nombre de la categoría es obligatorio.")

    try:
        duplicada = db.execute(
            text("""
                SELECT COUNT(*)
                FROM dbo.CATEGORIA
                WHERE LOWER(LTRIM(RTRIM(nombre))) = LOWER(:nombre)
            """),
            {"nombre": nombre}
        ).scalar()

        if duplicada:
            raise ValueError("Ya existe una categoría con ese nombre.")

        sql = """
            INSERT INTO dbo.CATEGORIA (
                nombre,
                descripcion,
                estado
            )
            OUTPUT
                INSERTED.id_categoria,
                INSERTED.nombre,
                INSERTED.descripcion,
                INSERTED.estado
            VALUES (
                :nombre,
                :descripcion,
                :estado
            )
        """

        datos = {
            "nombre": nombre,
            "descripcion": data.get("descripcion"),
            "estado": data.get("estado", True)
        }

        result = db.execute(text(sql), datos)
        categoria = _row_to_dict(result.fetchone())
        db.commit()

        return categoria

    except Exception:
        db.rollback()
        raise


# =========================================================
# VALIDACIÓN DE CATEGORÍAS
# =========================================================

def _validar_categoria(db: Session, id_categoria: int) -> None:
    """Comprueba que una categoría exista y esté activa."""

    categoria = db.execute(
        text("""
            SELECT estado
            FROM dbo.CATEGORIA
            WHERE id_categoria = :id_categoria
        """),
        {"id_categoria": id_categoria}
    ).fetchone()

    if categoria is None:
        raise ValueError("La categoría seleccionada no existe.")

    if not categoria.estado:
        raise ValueError("La categoría seleccionada está inactiva.")


# =========================================================
# PRODUCTOS
# =========================================================

def list_productos(
    db: Session,
    busqueda: str | None = None
) -> list[dict]:
    """Lista los productos y sus respectivas categorías."""

    sql = """
        SELECT
            id_producto,
            id_categoria,
            codigo,
            nombre,
            descripcion,
            precio_unitario,
            cantidad,
            stock_minimo,
            estado
        FROM dbo.PRODUCTO
    """

    params = {}

    if busqueda:
        sql += """
            WHERE nombre LIKE :busqueda
               OR codigo LIKE :busqueda
        """
        params["busqueda"] = f"%{busqueda}%"

    rows = db.execute(text(sql), params).fetchall()
    categorias = _load_categorias(db)

    resultado = []

    for row in rows:
        producto = _row_to_dict(row)
        producto["categoria"] = categorias.get(
            producto["id_categoria"], ""
        )
        resultado.append(producto)

    return resultado


def getproducto(db: Session, idProducto: int) -> dict | None:
    """Consulta un producto por su identificador."""

    sql = """
        SELECT
            id_producto,
            id_categoria,
            codigo,
            nombre,
            descripcion,
            precio_unitario,
            cantidad,
            stock_minimo,
            estado
        FROM dbo.PRODUCTO
        WHERE id_producto = :id
    """

    row = db.execute(
        text(sql),
        {"id": idProducto}
    ).fetchone()

    if not row:
        return None

    producto = _row_to_dict(row)
    categorias = _load_categorias(db)

    producto["categoria"] = categorias.get(
        producto["id_categoria"], ""
    )

    return producto


def createproducto(db: Session, data: dict) -> dict:
    """Registra un producto si su categoría existe y está activa."""

    try:
        datos = dict(data)

        _validar_categoria(db, datos["id_categoria"])

        sql = """
            INSERT INTO dbo.PRODUCTO (
                id_categoria,
                codigo,
                nombre,
                descripcion,
                precio_unitario,
                cantidad,
                stock_minimo,
                estado
            )
            OUTPUT INSERTED.id_producto
            VALUES (
                :id_categoria,
                :codigo,
                :nombre,
                :descripcion,
                :precio_unitario,
                :cantidad,
                :stock_minimo,
                :estado
            )
        """

        result = db.execute(text(sql), datos)
        nuevo_id = result.scalar_one()
        db.commit()

        return getproducto(db, nuevo_id)

    except Exception:
        db.rollback()
        raise


def updateproducto(
    db: Session,
    idProducto: int,
    data: dict
) -> dict | None:
    """Actualiza un producto y valida su categoría."""

    columnas_permitidas = {
        "id_categoria",
        "codigo",
        "nombre",
        "descripcion",
        "precio_unitario",
        "cantidad",
        "stock_minimo",
        "estado"
    }

    datos = {
        clave: valor
        for clave, valor in data.items()
        if clave in columnas_permitidas
    }

    if not datos:
        return getproducto(db, idProducto)

    try:
        if "id_categoria" in datos:
            _validar_categoria(db, datos["id_categoria"])

        asignaciones = ", ".join(
            f"{columna} = :{columna}"
            for columna in datos
        )

        sql = f"""
            UPDATE dbo.PRODUCTO
            SET {asignaciones}
            WHERE id_producto = :id
        """

        datos["id"] = idProducto

        result = db.execute(text(sql), datos)

        if result.rowcount == 0:
            db.rollback()
            return None

        db.commit()

        return getproducto(db, idProducto)

    except Exception:
        db.rollback()
        raise


def deleteproducto(db: Session, idProducto: int) -> bool:
    """Elimina lógicamente un producto (estado = 0)."""

    sql = """
        UPDATE dbo.PRODUCTO
        SET estado = 0
        WHERE id_producto = :id
    """

    try:
        result = db.execute(
            text(sql),
            {"id": idProducto}
        )

        eliminado = result.rowcount > 0
        db.commit()

        return eliminado

    except Exception:
        db.rollback()
        raise


# =========================================================
# INDICADORES DE INVENTARIO
# =========================================================

def productos_criticos(db: Session) -> list[dict]:
    """Consulta los productos que están por debajo del stock mínimo."""

    sql = """
        SELECT
            id_producto,
            id_categoria,
            codigo,
            nombre,
            descripcion,
            precio_unitario,
            cantidad,
            stock_minimo,
            estado
        FROM dbo.PRODUCTO
        WHERE cantidad < stock_minimo
          AND estado = 1
    """

    rows = db.execute(text(sql)).fetchall()
    categorias = _load_categorias(db)

    resultado = []

    for row in rows:
        producto = _row_to_dict(row)
        producto["categoria"] = categorias.get(
            producto["id_categoria"], ""
        )
        resultado.append(producto)

    return resultado


def valor_total_inventario(db: Session) -> float:
    """Calcula el valor total del inventario activo."""

    sql = """
        SELECT SUM(precio_unitario * cantidad)
        FROM dbo.PRODUCTO
        WHERE estado = 1
    """

    resultado = db.execute(text(sql)).scalar()

    return float(resultado or 0)
