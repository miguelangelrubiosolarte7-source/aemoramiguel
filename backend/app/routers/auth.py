from datetime import timedelta
import asyncio
import hashlib
import json
import re
import secrets
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.login_session import LoginSession
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    FirebaseTokenRequest,
    TokenResponse,
    RefreshTokenRequest,
)
from app.schemas.user import UserResponse
from app.security.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from app.security.middleware import limiter, sanitize_input_text

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registro de nuevo usuario",
)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def register(
    request: Request,
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Registra un nuevo usuario en PostgreSQL con validaciones de seguridad:
    - Previene colisión de nombres de usuario y correos electrónicos.
    - Contraseña hasheada con Bcrypt (12 rondas de sal criptográfica).
    - Asigna un UUID v4 inmutable.
    """
    # Check if username or email is already taken
    stmt = select(User).where(
        or_(User.username == payload.username.lower(), User.email == payload.email.lower())
    )
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        if existing_user.username == payload.username.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya se encuentra registrado.",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La dirección de correo electrónico ya se encuentra registrada.",
            )

    # Sanitize inputs
    sanitized_display_name = sanitize_input_text(payload.display_name)
    sanitized_bio = sanitize_input_text(payload.bio) if payload.bio else None

    # Default cyber avatar if none provided
    avatar_url = payload.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={payload.username}"

    # Hash password
    hashed_pwd = get_password_hash(payload.password)

    # Create user entity
    new_user = User(
        username=payload.username.lower(),
        email=payload.email.lower(),
        password_hash=hashed_pwd,
        display_name=sanitized_display_name,
        avatar_url=avatar_url,
        bio=sanitized_bio,
        role="user",
        is_active=True,
        is_verified=False,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Issue JWT tokens
    access_token = create_access_token(subject=str(new_user.id), role=new_user.role)
    refresh_token = create_refresh_token(subject=str(new_user.id))

    db.add(LoginSession(
        user_id=new_user.id,
        refresh_token_hash=hashlib.sha256(refresh_token.encode("utf-8")).hexdigest(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Inicio de sesión y obtención de tokens JWT",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login(
    request: Request,
    credentials: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Autentica credenciales contra la base de datos PostgreSQL:
    - Verificación temporal constante para mitigar ataques de temporización (Timing Attacks).
    - Retorna par de Access Token (corta vida) y Refresh Token (larga vida).
    """
    identifier = credentials.username_or_email.lower().strip()

    stmt = select(User).where(
        or_(User.username == identifier, User.email == identifier)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifica tu usuario y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta de Aemora ha sido suspendida.",
        )

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))
    db.add(LoginSession(
        user_id=user.id,
        refresh_token_hash=hashlib.sha256(refresh_token.encode("utf-8")).hexdigest(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


def _firebase_auth():
    """Create the Admin SDK lazily so email/password auth remains available without Firebase secrets."""
    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth_module, credentials
    except ImportError as error:
        raise HTTPException(status_code=503, detail="Firebase Admin no está instalado en el backend.") from error

    if not firebase_admin._apps:
        if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
            credential = credentials.Certificate(json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON))
        elif settings.FIREBASE_SERVICE_ACCOUNT_FILE:
            credential = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_FILE)
        else:
            raise HTTPException(
                status_code=503,
                detail="Firebase no está configurado en el backend. Completa FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_FILE.",
            )
        firebase_admin.initialize_app(credential, {"projectId": settings.FIREBASE_PROJECT_ID} if settings.FIREBASE_PROJECT_ID else None)

    return firebase_auth_module


@router.post(
    "/firebase",
    response_model=TokenResponse,
    summary="Intercambia un token de Firebase por una sesión Aemora",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def firebase_login(
    request: Request,
    payload: FirebaseTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    firebase_auth_module = _firebase_auth()
    try:
        decoded = await asyncio.to_thread(firebase_auth_module.verify_id_token, payload.id_token)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El token social de Firebase no es válido.") from error

    email = str(decoded.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El proveedor social no devolvió un correo electrónico.")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    picture = decoded.get("picture")
    display_name = str(decoded.get("name") or email.split("@", 1)[0])[:100]

    if user is None:
        raw_username = re.sub(r"[^a-zA-Z0-9_]", "_", email.split("@", 1)[0]).strip("_").lower() or "aemora_user"
        username = raw_username[:50]
        suffix = 1
        while (await db.execute(select(User).where(User.username == username))).scalar_one_or_none() is not None:
            suffix_text = f"_{suffix}"
            username = f"{raw_username[:50 - len(suffix_text)]}{suffix_text}"
            suffix += 1
        user = User(
            username=username,
            email=email,
            password_hash=get_password_hash(secrets.token_urlsafe(32)),
            display_name=display_name,
            avatar_url=str(picture) if picture else None,
            role="user",
            is_active=True,
            is_verified=bool(decoded.get("email_verified", False)),
        )
        db.add(user)
        await db.flush()
    elif picture and not user.avatar_url:
        user.avatar_url = str(picture)

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))
    db.add(LoginSession(
        user_id=user.id,
        refresh_token_hash=hashlib.sha256(refresh_token.encode("utf-8")).hexdigest(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/refresh",
    response_model=dict,
    summary="Renovar Access Token con Refresh Token",
)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Valida un Refresh Token criptográfico y emite un nuevo Access Token.
    """
    token_data = decode_token(payload.refresh_token, expected_type="refresh")
    user_id = token_data.get("sub")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión revocada o usuario inactivo.",
        )

    new_access_token = create_access_token(subject=str(user.id), role=user.role)

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener perfil del usuario autenticado",
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Retorna los datos del usuario conectado actualmente sin exponer password_hash."""
    return UserResponse.model_validate(current_user)
