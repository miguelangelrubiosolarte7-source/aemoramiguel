from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.search import UserSearchResponse
from app.schemas.user import UserBriefResponse

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("/search", response_model=UserSearchResponse)
async def search_users(
    q: str = Query(..., min_length=2, max_length=50),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    term = f"%{q.strip()}%"
    condition = or_(User.username.ilike(term), User.display_name.ilike(term), User.email.ilike(term))
    total = (await db.execute(select(func.count(User.id)).where(condition))).scalar_one()
    result = await db.execute(select(User).where(condition).order_by(User.display_name).limit(limit))
    return UserSearchResponse(
        items=[UserBriefResponse.model_validate(user) for user in result.scalars().all()],
        total=total,
    )
