"""
FastAPI application entry point for PÉTALO & AROMA.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRouter

app = FastAPI(
    title="PÉTALO & AROMA API",
    description="API para la administración de la floristería.",
    version="0.1.0",
)

# Permitir que el frontend de React (Vite) se comunique con la API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "app": "PÉTALO & AROMA",
        "version": "0.1.0",
        "status": "running",
    }


# Router con prefijo /api/v1 para los endpoints de la aplicación.
api_v1 = APIRouter(prefix="/api/v1", tags=["api"])


@api_v1.get("/health")
async def health():
    """Verifica que la API esté viva y que la BD esté conectada."""
    from .database import check_connection
    db_ok = False
    try:
        db_ok = check_connection()
    except Exception:
        db_ok = False
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
    }


# Rutas del módulo de inventario (se incluyen en api_v1 para heredar el prefijo).
from .routers.productos import router as _productos_router  # noqa: E402
api_v1.include_router(_productos_router)

# Rutas del módulo de ventas y clientes.
from .routers.ventas import router as _ventas_router  # noqa: E402
api_v1.include_router(_ventas_router)


# Registrar el router en la aplicación principal.
app.include_router(api_v1)