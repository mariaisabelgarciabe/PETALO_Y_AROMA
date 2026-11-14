"""
Generación de datos ficticios para pruebas (seed data).
Misma lógica que la función original en petalo_aroma.py, pero sin I/O.
"""
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker("es_MX")
Faker.seed(42)
random.seed(42)

TIPOS_FLOR = [
    "Rosa", "Tulipán", "Girasol", "Orquídea", "Clavel",
    "Lirio", "Margarita", "Peonía", "Hortensia", "Dalia",
]

CATEGORIA_POR_TIPO = {
    "Rosa": "Rosas",
    "Tulipán": "Tulipanes",
    "Girasol": "Girasoles",
    "Orquídea": "Orquídeas",
    "Clavel": "Claveles",
    "Lirio": "Lirios",
    "Margarita": "Margaritas",
    "Peonía": "Peonías",
    "Hortensia": "Hortensias",
    "Dalia": "Dalias",
}


def generar_registros(cantidad: int = 500) -> list[dict]:
    """Genera una lista de registros ficticios de compras."""
    registros = []
    anio = datetime.now().year
    fecha_base = datetime(anio, 1, 1)
    dias_anio = (datetime(anio + 1, 1, 1) - fecha_base).days
    for i in range(1, cantidad + 1):
        tipo = random.choice(TIPOS_FLOR)
        categoria = CATEGORIA_POR_TIPO[tipo]
        cantidad_unidades = random.randint(1, 20)
        precio_unitario = round(random.uniform(5000, 50000), 2)
        valor_total = round(cantidad_unidades * precio_unitario, 2)
        fecha = fecha_base + timedelta(days=random.randint(0, dias_anio - 1))
        registros.append({
            "ID": i,
            "Cliente": fake.name(),
            "Tipo de flor": tipo,
            "Categoría": categoria,
            "cantidad": cantidad_unidades,
            "precio_unitario": precio_unitario,
            "valor_total": valor_total,
            "fecha": fecha.strftime("%Y-%m-%d"),
        })
    return registros