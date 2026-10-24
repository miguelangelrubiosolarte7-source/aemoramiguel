from typing import List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserBriefResponse


class UserSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    items: List[UserBriefResponse]
    total: int
