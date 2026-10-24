import html
import re
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

# Initialize rate limiter using client IP
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    storage_uri="memory://",
)


def rate_limit_custom_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """
    Custom 429 Too Many Requests response complying with OWASP API4 standards.
    Returns clear retry information without exposing internal telemetry.
    """
    return JSONResponse(
        status_code=429,
        content={
            "error": "RateLimitExceeded",
            "message": "Demasiadas solicitudes. Has superado el límite de tasa de seguridad.",
            "detail": f"Límite alcanzado: {exc.detail}",
        },
        headers={"Retry-After": "60"},
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects OWASP Recommended Security Headers (OWASP API8 Security Misconfiguration).
    Protects against MIME sniffing, clickjacking, and enforces strict HTTPS.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # OWASP Essential Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        # Prevent caching of sensitive API responses
        if request.url.path.startswith("/api/v1/auth"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"

        # Mask server signature
        if "server" in response.headers:
            response.headers["server"] = "Aemora-Shield"

        return response


def sanitize_input_text(raw_text: str) -> str:
    """
    Sanitizes user input by stripping null bytes, removing hazardous script tags,
    and escaping unescaped HTML characters to neutralize stored XSS (OWASP API3/API8).
    """
    if not raw_text:
        return ""

    # 1. Remove null bytes and control chars (except newline and tab)
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", raw_text)

    # 2. Strip explicit <script> tags and javascript: pseudo-protocols
    cleaned = re.sub(r"(?i)<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"(?i)javascript:\s*", "", cleaned)
    cleaned = re.sub(r"(?i)on\w+\s*=", "", cleaned)

    # 3. HTML escape to safely render in client apps
    return html.escape(cleaned.strip())
