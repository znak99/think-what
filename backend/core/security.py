from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from core.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, SECRET_KEY
from database import get_db

bearer_scheme = HTTPBearer()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "type": "access", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "type": "refresh", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """토큰을 디코딩하여 payload 반환. 만료/변조 시 JWTError 발생."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Authorization: Bearer <token> 헤더에서 유저를 추출하는 FastAPI 의존성."""
    from models.user import User  # 순환 임포트 방지

    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증이 필요합니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise exc
        user_id: int = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise exc

    user = db.get(User, user_id)
    if user is None:
        raise exc
    return user
