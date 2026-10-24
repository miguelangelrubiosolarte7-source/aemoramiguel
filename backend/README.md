# 🛡️ Aemora Enterprise Backend (FastAPI + PostgreSQL + Groq AI)

Backend empresarial de alta seguridad y rendimiento para la red social **Aemora**, diseñado bajo la arquitectura asíncrona de **FastAPI**, **SQLAlchemy 2.0 (asyncpg)**, **PostgreSQL** (administrable en **pgAdmin**) y orquestación segura con **Groq Cloud AI**, en estricto cumplimiento de los estándares **OWASP API Security Top 10**.

---

## 📋 Tabla de Contenidos
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Guía Rápida de Instalación](#guía-rápida-de-instalación)
3. [Configuración en pgAdmin](#configuración-en-pgadmin)
4. [Variables de Entorno (.env)](#variables-de-entorno-env)
5. [Ejecución del Servidor](#ejecución-del-servidor)
6. [Matriz de Seguridad OWASP API Top 10](#matriz-de-seguridad-owasp-api-top-10)
7. [Documentación de la API](#documentación-de-la-api)

---

## 🏛️ Estructura del Proyecto

```text
backend/
├── schema.sql                 # Script DDL normalizado con UUID v4 e índices para pgAdmin
├── requirements.txt           # Dependencias fijadas para producción
├── .env.example               # Plantilla de variables de entorno
├── .env                       # Configuración activa para desarrollo
├── run.py                     # Entrypoint de ejecución directa Uvicorn
└── app/
    ├── main.py                # Instancia de FastAPI, middlewares de seguridad y CORS
    ├── config.py              # Validación tipada con Pydantic Settings
    ├── database.py            # AsyncEngine y AsyncSession con SQLAlchemy 2.0
    ├── models/                # Modelos ORM (UUIDs v4 y relaciones asíncronas)
    │   ├── user.py            # Entidad User (credenciales, roles, bio)
    │   ├── post.py            # Entidad Post (timeline, tags, autor)
    │   ├── like.py            # Entidad Like (restricción uq_user_post_like)
    │   └── audit.py           # Entidad AIAuditLog (auditoría OWASP API10)
    ├── schemas/               # DTOs de validación con Pydantic v2
    │   ├── auth.py            # Registro, login y gestión de tokens
    │   ├── user.py            # Perfiles públicos y brief de autor
    │   ├── post.py            # Creación, feed paginado e interacciones
    │   └── ai.py              # Peticiones y respuestas de orquestación IA
    ├── security/              # Núcleo de seguridad y cifrado
    │   ├── auth.py            # Hashing Bcrypt (12 rounds) y JWT (Access + Refresh)
    │   └── middleware.py      # SlowAPI Rate Limiting, cabeceras OWASP y sanitización
    ├── services/              # Lógica externa
    │   └── ai_service.py      # Groq Cloud SDK + Filtro Anti-Prompt Injection
    └── routers/               # Endpoints RESTful versionados (/api/v1)
        ├── auth.py            # /api/v1/auth (register, login, refresh, me)
        ├── posts.py           # /api/v1/posts (feed paginado, creación, BOLA delete, like)
        └── ai.py              # /api/v1/ai (orchestrate con auditoría)
```

---

## ⚡ Guía Rápida de Instalación

### 1. Crear y activar entorno virtual Python
Abre una terminal en la carpeta `backend`:

```powershell
# En Windows (PowerShell):
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Instalar dependencias
```powershell
pip install -r requirements.txt
```

---

## 🐘 Configuración en pgAdmin (PostgreSQL)

1. Abre **pgAdmin 4** y conéctate a tu servidor PostgreSQL local.
2. Crea una nueva base de datos llamada `aemora_db`:
   - Clic derecho en **Databases** > **Create** > **Database...**
   - Nombre: `aemora_db` > Clic en **Save**.
3. Selecciona `aemora_db` en el árbol lateral y abre el **Query Tool**:
   - Menú superior: **Tools** > **Query Tool** (o clic derecho en la base de datos > *Query Tool*).
4. Abre o pega el contenido del archivo [`backend/schema.sql`](file:///C:/Users/migue/.gemini/antigravity/scratch/aemora/backend/schema.sql).
5. Presiona **F5** (o el botón de **Execute / Play** ▶️).
6. El script ejecutará:
   - Extensión `pgcrypto` para generación nativa de UUIDs v4.
   - Tablas `users`, `posts`, `likes` y `ai_audit_logs`.
   - Índices optimizados B-Tree y GIN para tags.
   - Triggers para actualización automática de `updated_at`.
   - Carga inicial de usuarios de demostración (`aemora_core` y `elena_security`).

---

## 🔐 Variables de Entorno (`.env`)

Asegúrate de ajustar los parámetros en `backend/.env` según tu entorno:

```ini
PROJECT_NAME="Aemora Enterprise API"
ENVIRONMENT="development"
DEBUG=True
API_V1_STR="/api/v1"

# Clave secreta para firma JWT
SECRET_KEY="tu_clave_secreta_jwt_super_segura"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cadena de conexión asyncpg
# Formato: postgresql+asyncpg://usuario:contraseña@servidor:puerto/nombre_bd
DATABASE_URL="postgresql+asyncpg://postgres:TU_PASSWORD@localhost:5432/aemora_db"

# API Key de Groq Cloud
GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.3-70b-versatile"
```

---

## 🚀 Ejecución del Servidor

Inicia el backend en modo desarrollo con auto-reload:

```powershell
python run.py
```

O directamente mediante Uvicorn:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🛡️ Matriz de Seguridad OWASP API Top 10

| Regla OWASP | Control Implementado en Aemora Backend |
| :--- | :--- |
| **API1: BOLA** *(Broken Object Level Authorization)* | El endpoint `DELETE /api/v1/posts/{post_id}` valida estrictamente que `post.author_id == current_user.id` antes de permitir la eliminación. |
| **API2: Broken Authentication** | Hashing con **Bcrypt** (costo 12), firma digital **JWT**, expiración corta (30 min) y Refresh Tokens rotativos con tipos de token desacoplados. |
| **API3: BOPLA** *(Broken Object Property)* | Schemas Pydantic v2 independientes para entrada y salida. `password_hash` nunca se expone en ninguna respuesta. |
| **API4: Unrestricted Resource Consumption** | **SlowAPI Rate Limiter**: 5 reg/min en registro, 10 req/min en login, 20 req/min en IA. Paginación máxima limitada a 50 elementos por solicitud. |
| **API5: BFLA** *(Broken Function Level Auth)* | Decorador e inyección de dependencia `require_role("admin")` para endpoints privilegiados. |
| **API6: Unrestricted Business Flows** | Auditoría exhaustiva en `ai_audit_logs` con hash SHA-256 de prompts para prevenir explotación o abuso de cuota. |
| **API7: SSRF** *(Server-Side Request Forgery)* | No se aceptan descargas de URLs externas arbitrarias no autorizadas. |
| **API8: Security Misconfiguration** | Middleware personalizado que inyecta cabeceras `nosniff`, `DENY` en iframes, `HSTS`, `Referrer-Policy` y CORS restrictivo por lista blanca. |
| **API9: Improper Inventory Management** | Rutas versionadas `/api/v1/` con OpenAPI / Swagger y ReDoc sincronizados. |
| **API10: Unsafe Consumption of APIs** | `ai_service.py` aplica filtros heurísticos **Anti-Prompt Injection** antes de delegar las consultas a Groq Cloud. |

---

## 📖 Documentación Interactiva

Una vez iniciado el servidor, accede a la documentación interactiva:
* **Swagger UI (OpenAPI):** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
* **ReDoc:** [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
* **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
