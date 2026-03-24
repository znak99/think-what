from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.security import create_access_token, create_refresh_token, hash_password
from database import get_db
from models.user import User
from schemas.auth import SignupRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["인증"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """회원가입. 성공 시 토큰을 발급하여 바로 게임 화면으로 이동할 수 있습니다."""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 이메일입니다.")

    if db.query(User).filter(User.nickname == body.nickname).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 닉네임입니다.")

    user = User(
        email=body.email,
        nickname=body.nickname,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )
