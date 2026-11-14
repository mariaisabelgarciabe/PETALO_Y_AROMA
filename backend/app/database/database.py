"""
Configuración de la base de datos SQL Server usando PyODBC y SQLAlchemy.
Autenticación integrada de Windows (Trusted_Connection=yes).
Las variables de entorno se leen del archivo .env.
No se incluyen credenciales en el código ni en .env.example.
"""
import os
from typing import Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL

from dotenv import load_dotenv

load_dotenv()

engine = None
SessionLocal = None


def _build_engine():
    global engine, SessionLocal
    if engine is not None:
        return engine

    DB_CONNECTION_STRING = os.getenv("DB_CONNECTION_STRING")
    if DB_CONNECTION_STRING:
        # Cadena ODBC directa, p. ej.:
        # "DRIVER={ODBC Driver 17 for SQL Server};SERVER=LAPTOP-U5BEOHAJ\\SQLEXPRESS;DATABASE=PETALO_AROMA;Trusted_Connection=yes;TrustServerCertificate=yes"
        DB_URL = URL.create(
            "mssql+pyodbc",
            query={"odbc_connect": DB_CONNECTION_STRING},
        )
    else:
        DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
        DB_SERVER = os.getenv("DB_SERVER")
        DB_NAME = os.getenv("DB_NAME")
        DB_USER = os.getenv("DB_USER")
        DB_PASSWORD = os.getenv("DB_PASSWORD")
        trusted = os.getenv("DB_TRUSTED_CONNECTION", "yes")
        trust_cert = os.getenv("DB_TRUST_SERVER_CERTIFICATE", "yes")

        if not all([DB_SERVER, DB_NAME]):
            raise RuntimeError(
                "Configuración de base de datos incompleta. "
                "Define DB_CONNECTION_STRING o DB_SERVER/DB_NAME."
            )

        if DB_USER and DB_PASSWORD:
            # Autenticación SQL Server con usuario/contraseña
            DB_URL = URL.create(
                "mssql+pyodbc",
                username=DB_USER,
                password=DB_PASSWORD,
                host=DB_SERVER,
                database=DB_NAME,
                query={"driver": DB_DRIVER, "TrustServerCertificate": trust_cert},
            )
        else:
            # Autenticación integrada de Windows (Trusted_Connection=yes)
            odbc_connect = (
                f"DRIVER={{{DB_DRIVER}}};"
                f"SERVER={DB_SERVER};"
                f"DATABASE={DB_NAME};"
                f"Trusted_Connection={trusted};"
                f"TrustServerCertificate={trust_cert}"
            )
            DB_URL = URL.create(
                "mssql+pyodbc",
                query={"odbc_connect": odbc_connect},
            )

    engine = create_engine(DB_URL, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine


def get_db():
    """Dependency de FastAPI que provee una sessions por request."""
    if SessionLocal is None:
        _build_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_connection():
    """Verifica que la conexión con SQL Server funcione."""
    if engine is None:
        _build_engine()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        return result.scalar() == 1