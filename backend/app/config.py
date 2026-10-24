import os

from dotenv import load_dotenv


load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class Settings:
    PROJECT_NAME: str = "Aemora Enterprise API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Cryptography & JWT Security
    SECRET_KEY: str = "aemora_enterprise_super_secure_key_2026_dev_x92k"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database URL (psycopg)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg://postgres:admin123@127.0.0.1:5432/aemora_db"
    )

    # Firebase Admin verification for social login
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_SERVICE_ACCOUNT_JSON: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    FIREBASE_SERVICE_ACCOUNT_FILE: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE", "")
    
    # AI Engine Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Rate Limiting (SlowAPI) - Requeridos por los routers
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_AI: str = "10/minute"
    RATE_LIMIT_POSTS: str = "30/minute"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3003",
    ]

settings = Settings()
