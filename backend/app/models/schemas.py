
"""Esquemas Pydantic para los modelos de la aplicación."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ProductoBase(BaseModel):
    id_categoria: int = Field(..., ge=1)
    codigo: Optional[str] = Field(None, max_length=20)
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    precio_unitario: float = Field(..., ge=0)
    cantidad: int = Field(..., ge=0)
    stock_minimo: int = Field(..., ge=0)
    estado: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    id_categoria: Optional[int] = Field(None, ge=1)
    codigo: Optional[str] = Field(None, max_length=20)
    nombre: Optional[str] = Field(None, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    precio_unitario: Optional[float] = Field(None, ge=0)
    cantidad: Optional[int] = Field(None, ge=0)
    stock_minimo: Optional[int] = Field(None, ge=0)
    estado: Optional[bool] = None


class ProductoResponse(ProductoBase):
    id_producto: int

    model_config = ConfigDict(from_attributes=True)


class CategoryBase(BaseModel):
    nombre: str = Field(..., max_length=50)
    descripcion: Optional[str] = Field(None, max_length=255)
    estado: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id_categoria: int

    model_config = ConfigDict(from_attributes=True)



class ClienteBase(BaseModel):
    nombres: str = Field(..., max_length=100)
    apellidos: str = Field(..., max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    direccion: Optional[str] = Field(None, max_length=255)


class ClienteCreate(ClienteBase):
    pass


class ClienteResponse(ClienteBase):
    id_cliente: int
    fecha_registro: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DetalleVentaCreate(BaseModel):
    id_producto: int = Field(..., ge=1)
    cantidad: int = Field(..., ge=1)


class VentaCreate(BaseModel):
    id_cliente: Optional[int] = Field(None, ge=1)
    metodo_pago: str = Field(..., min_length=1)
    detalles: list[DetalleVentaCreate] = Field(..., min_length=1)


class VentaResponse(BaseModel):
    id_venta: int
    id_cliente: Optional[int] = None
    fecha_venta: datetime
    metodo_pago: str
    total: float
    estado: bool

    model_config = ConfigDict(from_attributes=True)
