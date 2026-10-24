import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.user import UserBriefResponse
from app.schemas.comment import CommentResponse


class PostCreateRequest(BaseModel):
    content: str = Field(default="", max_length=2800)
    tags: List[str] = Field(default_factory=list, max_length=10)
    media: List[dict] = Field(default_factory=list, max_length=4)
    ai_generated: bool = False


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    author_id: uuid.UUID
    author: UserBriefResponse
    content: str
    tags: List[str]
    media: List[dict] = Field(default_factory=list)
    ai_generated: bool
    likes_count: int = 0
    is_liked_by_me: bool = False
    comments: List[CommentResponse] = Field(default_factory=list)
    comments_count: int = 0
    created_at: datetime
    updated_at: datetime


class PostFeedResponse(BaseModel):
    items: List[PostResponse]
    total: int
    page: int
    limit: int
    has_more: bool


class PostLikeResponse(BaseModel):
    post_id: uuid.UUID
    liked: bool
    total_likes: int
