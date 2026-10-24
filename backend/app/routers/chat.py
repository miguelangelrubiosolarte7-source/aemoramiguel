import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.message import Message
from app.models.user import User
from app.security.auth import get_current_user
from app.security.middleware import sanitize_input_text

router = APIRouter(prefix="/messages", tags=["Mensajes Directos"])


class MessageCreate(BaseModel):
    receiver_id: uuid.UUID
    content: str = Field(..., min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    message = Message(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        content=sanitize_input_text(payload.content),
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


@router.get("/{other_user_id}", response_model=list[MessageResponse])
async def get_chat_history(
    other_user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Message).where(
        or_(
            (Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id),
            (Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id),
        ),
        ).order_by(Message.created_at.asc())
    return list((await db.execute(stmt)).scalars().all())
