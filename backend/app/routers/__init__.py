from app.routers.auth import router as auth_router
from app.routers.posts import router as posts_router
from app.routers.ai import router as ai_router
from app.routers.users import router as users_router

__all__ = ["auth_router", "posts_router", "ai_router", "users_router"]
