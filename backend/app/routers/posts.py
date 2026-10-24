import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from pathlib import Path
from sqlalchemy import select, func, desc, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models.post import Post
from app.models.like import Like
from app.models.user import User
from app.schemas.post import (
    PostCreateRequest,
    PostResponse,
    PostFeedResponse,
    PostLikeResponse,
)
from app.schemas.user import UserBriefResponse
from app.schemas.comment import CommentCreateRequest, CommentResponse
from app.models.comment import Comment
from app.security.auth import get_current_user, oauth2_scheme, decode_token
from app.security.middleware import limiter, sanitize_input_text

router = APIRouter(prefix="/posts", tags=["Publicaciones & Feed"])
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def get_optional_user_id(
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[uuid.UUID]:
    """Helper to detect if requesting user is authenticated without throwing 401."""
    if not token:
        return None
    try:
        payload = decode_token(token, expected_type="access")
        return uuid.UUID(payload.get("sub"))
    except Exception:
        return None


@router.get(
    "",
    response_model=PostFeedResponse,
    summary="Listado paginado de publicaciones (Timeline)",
)
@limiter.limit(settings.RATE_LIMIT_POSTS)
async def list_posts(
    request: Request,
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=50, description="Elementos por página (máx 50)"),
    tag: Optional[str] = Query(None, description="Filtrar por etiqueta/hashtag"),
    search: Optional[str] = Query(None, description="Buscar palabras clave en contenido"),
    username: Optional[str] = Query(None, min_length=3, max_length=50, description="Posts de un usuario"),
    db: AsyncSession = Depends(get_db),
    optional_user_id: Optional[uuid.UUID] = Depends(get_optional_user_id),
):
    """
    Obtiene el feed de publicaciones respaldado directamente en PostgreSQL:
    - Paginación estricta (OWASP API4 Unrestricted Resource Consumption).
    - Carga optimizada de autores y conteo de interacciones.
    """
    offset = (page - 1) * limit

    # Base query with eager loading of author
    query = select(Post).options(selectinload(Post.author)).order_by(desc(Post.created_at))

    # Apply tag filter
    if tag:
        clean_tag = tag.strip().lstrip("#")
        query = query.where(Post.tags.any(clean_tag))

    # Apply text search filter
    if search:
        safe_search = f"%{search.strip()}%"
        query = query.where(Post.content.ilike(safe_search))
    if username:
        query = query.where(Post.author.has(User.username == username.strip().lower()))

    # Execute total count
    count_stmt = select(func.count(Post.id))
    if tag:
        clean_tag = tag.strip().lstrip("#")
        count_stmt = count_stmt.where(Post.tags.any(clean_tag))
    if search:
        safe_search = f"%{search.strip()}%"
        count_stmt = count_stmt.where(Post.content.ilike(safe_search))
    if username:
        count_stmt = count_stmt.where(Post.author.has(User.username == username.strip().lower()))

    total_count = (await db.execute(count_stmt)).scalar_one()

    # Apply pagination
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    posts = result.scalars().all()

    # Compute like metrics
    items: List[PostResponse] = []
    for post in posts:
        # Count likes for this post
        likes_count_stmt = select(func.count(Like.id)).where(Like.post_id == post.id)
        likes_count = (await db.execute(likes_count_stmt)).scalar_one()

        # Check if user liked it
        is_liked = False
        if optional_user_id:
            check_like_stmt = select(Like.id).where(
                Like.post_id == post.id, Like.user_id == optional_user_id
            )
            is_liked = (await db.execute(check_like_stmt)).scalar_one_or_none() is not None

        items.append(
            PostResponse(
                id=post.id,
                author_id=post.author_id,
                author=UserBriefResponse.model_validate(post.author),
                content=post.content,
                media=post.media or [],
                tags=post.tags or [],
                ai_generated=post.ai_generated,
                likes_count=likes_count,
                is_liked_by_me=is_liked,
                created_at=post.created_at,
                updated_at=post.updated_at,
                comments=[
                    CommentResponse(
                        id=comment.id,
                        post_id=comment.post_id,
                        author=UserBriefResponse.model_validate(comment.author),
                        content=comment.content,
                        created_at=comment.created_at,
                        updated_at=comment.updated_at,
                    )
                    for comment in post.comments
                ],
                comments_count=len(post.comments),
            )
        )

    has_more = (offset + limit) < total_count

    return PostFeedResponse(
        items=items,
        total=total_count,
        page=page,
        limit=limit,
        has_more=has_more,
    )


@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nueva publicación en el feed",
)
@limiter.limit(settings.RATE_LIMIT_POSTS)
async def create_post(
    request: Request,
    payload: PostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Publica un nuevo post con sanitización contra XSS e inyecciones:
    - Asocia al autor autenticado de forma inmutable.
    """
    sanitized_content = sanitize_input_text(payload.content)
    clean_tags = [
        sanitize_input_text(t.strip().lstrip("#"))
        for t in payload.tags
        if t.strip()
    ][:10]
    clean_media = [
        {
            "id": str(item.get("id") or uuid.uuid4()),
            "type": "image",
            "url": item["url"],
            "altText": str(item.get("altText") or "Imagen compartida en Aemora")[:200],
        }
        for item in payload.media[:4]
        if isinstance(item, dict)
        and isinstance(item.get("url"), str)
        and item["url"].startswith(("https://", "/media/"))
    ]
    if not sanitized_content and not clean_media:
        raise HTTPException(status_code=400, detail="La publicación debe incluir texto o al menos una imagen.")

    post = Post(
        author_id=current_user.id,
        content=sanitized_content,
        tags=clean_tags,
        media=clean_media,
        ai_generated=payload.ai_generated,
    )

    db.add(post)
    await db.commit()
    await db.refresh(post)

    return PostResponse(
        id=post.id,
        author_id=post.author_id,
        author=UserBriefResponse.model_validate(current_user),
        content=post.content,
        media=post.media or [],
        tags=post.tags,
        ai_generated=post.ai_generated,
        likes_count=0,
        is_liked_by_me=False,
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=[],
        comments_count=0,
    )


@router.post("/media", summary="Subir imagen para una publicación")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Solo se permiten imágenes JPG, PNG, WEBP o GIF.")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="La imagen no puede superar 5 MB.")
    suffix = Path(file.filename or "image.jpg").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        suffix = ".jpg"
    filename = f"{current_user.id}_{uuid.uuid4().hex}{suffix}"
    (UPLOAD_DIR / filename).write_bytes(data)
    return {"url": f"/media/{filename}", "altText": "Imagen compartida en Aemora"}


@router.post("/{post_id}/comments", response_model=CommentResponse,
             status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: uuid.UUID,
    payload: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Guarda un comentario asociado a la publicación y al usuario autenticado."""
    if payload.post_id != post_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="El post_id no coincide con la ruta.")

    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Publicación no encontrada.")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=sanitize_input_text(payload.content),
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        author=UserBriefResponse.model_validate(current_user),
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar una publicación (BOLA Defense - OWASP API1)",
)
async def delete_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Protección Broken Object Level Authorization (OWASP API1):
    Solo el autor original o un administrador pueden eliminar la publicación.
    """
    stmt = select(Post).where(Post.id == post_id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada.",
        )

    # Strict BOLA validation
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes autorización para eliminar esta publicación ajena.",
        )

    await db.delete(post)
    await db.commit()
    return None


@router.post(
    "/{post_id}/like",
    response_model=PostLikeResponse,
    summary="Alternar like en una publicación",
)
async def toggle_like(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Alterna (Toggle) el estado de like de un post de forma atómica en PostgreSQL.
    """
    # Verify post exists
    stmt_post = select(Post.id).where(Post.id == post_id)
    if not (await db.execute(stmt_post)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La publicación no existe.",
        )

    # Check if already liked
    stmt_like = select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id)
    like_record = (await db.execute(stmt_like)).scalar_one_or_none()

    liked = False
    if like_record:
        # Unlike
        await db.delete(like_record)
        await db.commit()
        liked = False
    else:
        # Like
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        await db.commit()
        liked = True

    # Count total likes
    total_likes_stmt = select(func.count(Like.id)).where(Like.post_id == post_id)
    total_likes = (await db.execute(total_likes_stmt)).scalar_one()

    return PostLikeResponse(
        post_id=post_id,
        liked=liked,
        total_likes=total_likes,
    )
