
"""Rutas de productos, categorías e inventario."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..services import inventario_service
from ..models.schemas import ProductoCreate, ProductoUpdate, CategoryCreate


router = APIRouter(tags=["inventario"])


# =========================================================
# CATEGORÍAS
# =========================================================

@router.get("/categorias")
async def list_categorias(db: Session = Depends(get_db)):
    """Lista todas las categorías registradas."""

    try:
        items = inventario_service.list_categorias(db)

        return {
            "total": len(items),
            "categorias": items
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al consultar categorías: {e}"
        )


@router.post("/categorias", status_code=201)
async def create_categoria(
    data: CategoryCreate,
    db: Session = Depends(get_db)
):
    """Registra una nueva categoría."""

    try:
        payload = data.model_dump()
        item = inventario_service.create_categoria(db, payload)
        return item

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="No fue posible registrar la categoría."
        )


# =========================================================
# PRODUCTOS
# =========================================================

@router.get("/productos")
async def list_productos(
    busqueda: Optional[str] = Query(
        None,
        description="Busca por nombre o código"
    ),
    db: Session = Depends(get_db)
):
    """Lista todos los productos registrados."""

    try:
        items = inventario_service.list_productos(
            db,
            busqueda=busqueda
        )

        return {
            "total": len(items),
            "productos": items
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al consultar productos: {e}"
        )


@router.get("/productos/{idProducto}")
async def get_productos(
    idProducto: int,
    db: Session = Depends(get_db)
):
    """Obtiene un producto por su ID."""

    item = inventario_service.getproducto(db, idProducto)

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return item


@router.post("/productos", status_code=201)
async def create_productos(
    data: ProductoCreate,
    db: Session = Depends(get_db)
):
    """Registra un nuevo producto."""

    try:
        payload = data.model_dump()
        item = inventario_service.createproducto(db, payload)
        return item

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear producto: {e}"
        )


@router.put("/productos/{idProducto}")
async def update_productos(
    idProducto: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza un producto existente."""

    try:
        payload = data.model_dump(exclude_none=True)

        item = inventario_service.updateproducto(
            db,
            idProducto,
            payload
        )

        if not item:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        return item

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar producto: {e}"
        )


@router.delete("/productos/{idProducto}")
async def delete_productos(
    idProducto: int,
    db: Session = Depends(get_db)
):
    """Desactiva un producto."""

    try:
        ok = inventario_service.deleteproducto(db, idProducto)

        if not ok:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        return {
            "message": "Producto desactivado correctamente"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al desactivar producto: {e}"
        )


# =========================================================
# INDICADORES DE INVENTARIO
# =========================================================

@router.get("/inventario/criticos")
async def productos_criticos(db: Session = Depends(get_db)):
    """Consulta los productos con existencias inferiores al mínimo."""

    try:
        items = inventario_service.productos_criticos(db)

        return {
            "total": len(items),
            "criticos": items
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al consultar inventario crítico: {e}"
        )


@router.get("/inventario/valor-total")
async def valor_total(db: Session = Depends(get_db)):
    """Calcula el valor total del inventario."""

    try:
        total = inventario_service.valor_total_inventario(db)

        return {
            "valor_total": total
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al calcular el valor del inventario: {e}"
        )
