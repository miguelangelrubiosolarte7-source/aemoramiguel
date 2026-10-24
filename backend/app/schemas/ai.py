from typing import Literal, Optional
from pydantic import BaseModel, Field


class AIOrchestrateRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=2,
        max_length=1500,
        description="Contenido textual a analizar, mejorar o consultar",
    )
    action: Literal["improve", "cyber_hashtags", "fact_check", "chat_assistant"] = Field(
        default="improve",
        description="Operación de inteligencia artificial solicitada",
    )
    context: Optional[str] = Field(
        None,
        max_length=500,
        description="Contexto opcional de la conversación o tema",
    )


class AIOrchestrateResponse(BaseModel):
    result: str
    action: str
    model: str
    tokens_used: int
    sanitized: bool
    prompt_hash: str
