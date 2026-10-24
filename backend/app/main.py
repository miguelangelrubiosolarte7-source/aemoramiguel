from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.config import settings
from app.database import engine, init_db
from app import models
from app.security.middleware import (
    limiter,
    rate_limit_custom_handler,
    SecurityHeadersMiddleware,
)
from app.routers import auth_router, posts_router, ai_router, users_router
from app.routers.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestión del ciclo de vida de la aplicación:
    - Precalienta el pool de conexiones de base de datos.
    - Cierre limpio de recursos al terminar.
    """
    # Startup: ensure all SQLAlchemy models exist, then verify PostgreSQL.
    await init_db()
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        print(f"[Aemora DB Warning]: No se pudo conectar a PostgreSQL en el arranque ({e}). "
              f"Asegúrate de que el servicio de base de datos esté iniciado.")

    yield

    # Shutdown: dispose DB connection pool
    await engine.dispose()


# Create FastAPI application with OWASP hardened configuration
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend Empresarial de Alta Seguridad para Aemora Social Network (OWASP Top 10 Compliant)",
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# 1. SlowAPI Rate Limiter State & Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_custom_handler)

# 2. OWASP Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 3. Restrictive CORS Middleware (OWASP API8)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):30\d{2}",
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Retry-After", "X-Content-Type-Options"],
    max_age=600,
)

# 4. Include Versioned API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(posts_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.mount("/media", StaticFiles(directory=Path(__file__).resolve().parents[1] / "uploads"), name="media")


@app.get("/", tags=["Estado del Sistema"])
async def root():
    """Endpoint raíz con metadatos de seguridad del servicio."""
    return {
        "system": "Aemora Enterprise API",
        "status": "operational",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_STR}/docs",
        "security_profile": "OWASP API Top 10 Enforced",
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Estado del Sistema"])
async def health_check():
    """
    Health check verificado para balanceadores de carga y sondas Kubernetes.
    Comprueba conectividad con PostgreSQL.
    """
    db_status = "connected"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unreachable: {type(e).__name__}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "ai_engine": "Groq Cloud (Llama 3.3 70B)",
    }
modern_app = app
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar routers
from app.routers import auth, posts, ai, interactions, messages
 

app = FastAPI(
    title="Aemora Backend API",
    version="1.0.0",
    description="Backend empresarial para la red social Aemora"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción poner la URL de Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(ai.router)
app.include_router(interactions.router)
app.include_router(messages.router)

@app.get("/")
def read_root():
    return {"status": "Aemora Backend is running successfully"}


app = modern_app
