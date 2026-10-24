import os
import sys
import asyncio
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase
from psycopg import AsyncConnection

# Configurar el selector de loop de eventos correcto en Windows
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:admin123@127.0.0.1:5432/aemora_db"
)

# Motor de SQLAlchemy optimizado con fallbacks de socket para asyncpg
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "sslmode": "disable",
        "application_name": "aemora_backend"
    }
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        # Compatibilidad con la tabla comments creada por la versión anterior.
        # create_all no modifica tablas existentes, por eso añadimos la columna
        # de forma idempotente sin borrar datos.
        await connection.execute(text(
            "ALTER TABLE comments "
            "ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ "
            "NOT NULL DEFAULT now()"
        ))
        await connection.execute(text(
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb"
        ))

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@asynccontextmanager
async def get_db_connection():
    """Compatibility connection for legacy routers using psycopg."""
    connection = await AsyncConnection.connect(
        DATABASE_URL.replace("+psycopg", ""),
        sslmode="disable",
    )
    try:
        yield connection
    finally:
        await connection.close()

