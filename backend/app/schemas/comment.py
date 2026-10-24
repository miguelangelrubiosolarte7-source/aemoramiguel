import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserBriefResponse


class CommentCreateRequest(BaseModel):
    post_id: uuid.UUID
    content: str = Field(..., min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    post_id: uuid.UUID
    author: UserBriefResponse
    content: str
    created_at: datetime
    updated_at: datetime
