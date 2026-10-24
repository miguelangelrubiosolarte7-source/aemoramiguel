from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from uuid import UUID
from app.security.auth import get_current_user_id
from app.database import get_db_connection

router = APIRouter(prefix="/api/v1/messages", tags=["Mensajes Directos"])

class MessageCreateSchema(BaseModel):
    receiver_id: UUID
    content: str

# 1. ENVIAR MENSAJE
@router.post("/", status_code=status.HTTP_201_CREATED)
async def send_message(payload: MessageCreateSchema, current_user_id: UUID = Depends(get_current_user_id)):
    async with get_db_connection() as conn:
        message = await conn.fetchrow(
            """
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, sender_id, receiver_id, content, is_read, created_at
            """,
            current_user_id, payload.receiver_id, payload.content
        )
        return dict(message)

# 2. OBTENER CHAT ENTRE DOS USUARIOS
@router.get("/{other_user_id}")
async def get_chat_history(other_user_id: UUID, current_user_id: UUID = Depends(get_current_user_id)):
    async with get_db_connection() as conn:
        messages = await conn.fetch(
            """
            SELECT id, sender_id, receiver_id, content, is_read, created_at
            FROM messages
            WHERE (sender_id = $1 AND receiver_id = $2)
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
            """,
            current_user_id, other_user_id
        )
        return [dict(m) for m in messages]