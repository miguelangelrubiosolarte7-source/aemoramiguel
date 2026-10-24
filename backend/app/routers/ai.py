from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.ai import AIOrchestrateRequest, AIOrchestrateResponse
from app.services.ai_service import ai_service
from app.security.auth import get_current_user
from app.security.middleware import limiter

router = APIRouter(prefix="/ai", tags=["Motor de Inteligencia Artificial"])


@router.post(
    "/orchestrate",
    response_model=AIOrchestrateResponse,
    summary="Orquestación de IA con Groq Cloud y filtros Anti-Prompt Injection",
)
@limiter.limit(settings.RATE_LIMIT_AI)
async def orchestrate_ai(
    request: Request,
    payload: AIOrchestrateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Motor seguro de Inteligencia Artificial de Aemora:
    - Filtro heurístico Anti-Prompt Injection (OWASP API10).
    - Inferencia de alta velocidad mediante Groq Cloud (Llama 3.3 70B).
    - Registro inmutable en la tabla de auditoría `ai_audit_logs`.
    """
    client_ip = request.client.host if request.client else None

    result_text, tokens_used, was_sanitized, prompt_hash = await ai_service.orchestrate(
        prompt=payload.prompt,
        action=payload.action,
        context=payload.context,
        user_id=current_user.id,
        ip_address=client_ip,
        db=db,
    )

    return AIOrchestrateResponse(
        result=result_text,
        action=payload.action,
        model=settings.GROQ_MODEL,
        tokens_used=tokens_used,
        sanitized=was_sanitized,
        prompt_hash=prompt_hash,
    )
