from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from uuid import UUID
from app.security.auth import get_current_user_id
from app.database import get_db_connection

router = APIRouter(prefix="/api/v1/interactions", tags=["Interacciones (Likes y Comentarios)"])

class CommentCreateSchema(BaseModel):
    post_id: UUID
    content: str

# 1. DAR O QUITAR LIKE A UN POST
@router.post("/like/{post_id}", status_code=status.HTTP_200_OK)
async def toggle_like(post_id: UUID, current_user_id: UUID = Depends(get_current_user_id)):
    async with get_db_connection() as conn:
        # Verificar si ya existe el like
        existing_like = await conn.fetchrow(
            "SELECT id FROM likes WHERE user_id = $1 AND post_id = $2",
            current_user_id, post_id
        )
        if existing_like:
            await conn.execute("DELETE FROM likes WHERE id = $1", existing_like["id"])
            return {"message": "Like eliminado"}
        else:
            await conn.execute(
                "INSERT INTO likes (user_id, post_id) VALUES ($1, $2)",
                current_user_id, post_id
            )
            return {"message": "Like agregado"}

# 2. CREAR UN COMENTARIO
@router.post("/comment", status_code=status.HTTP_201_CREATED)
async def create_comment(payload: CommentCreateSchema, current_user_id: UUID = Depends(get_current_user_id)):
    async with get_db_connection() as conn:
        comment = await conn.fetchrow(
            """
            INSERT INTO comments (post_id, user_id, content) 
            VALUES ($1, $2, $3) 
            RETURNING id, post_id, user_id, content, created_at
            """,
            payload.post_id, current_user_id, payload.content
        )
        return dict(comment)

# 3. VER COMENTARIOS DE UN POST
@router.get("/comments/{post_id}")
async def get_post_comments(post_id: UUID):
    async with get_db_connection() as conn:
        comments = await conn.fetch(
            """
            SELECT c.id, c.content, c.created_at, u.username, u.display_name, u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
            """,
            post_id
        )
        return [dict(c) for c in comments]