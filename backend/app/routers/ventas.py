
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..services import ventas_service
from ..models.schemas import (
    ClienteCreate,
    VentaCreate
)

router = APIRouter(tags=["ventas"])


# =========================================================
# CLIENTES
# =========================================================

@router.get("/clientes")
def obtener_clientes(db: Session = Depends(get_db)):
    return {
        "clientes": ventas_service.list_clientes(db)
    }


@router.post("/clientes", status_code=201)
def registrar_cliente(
    data: ClienteCreate,
    db: Session = Depends(get_db)
):
    try:
        cliente = ventas_service.create_cliente(
            db,
            data.model_dump()
        )

        return cliente

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================================
# VENTAS
# =========================================================

@router.get("/ventas")
def obtener_ventas(db: Session = Depends(get_db)):
    return {
        "ventas": ventas_service.list_ventas(db)
    }


@router.post("/ventas", status_code=201)
def registrar_venta(
    data: VentaCreate,
    db: Session = Depends(get_db)
):
    try:
        venta = ventas_service.create_venta(
            db,
            data.model_dump()
        )

        return venta

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="No fue posible registrar la venta."
        )
