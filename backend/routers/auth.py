from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.security import create_access_token, create_refresh_token, hash_password, verify_password
from database import get_db
from models.user import User
from schemas.auth import LoginRequest, PasswordResetConfirmRequest, PasswordResetRequest, SignupRequest, TokenResponse

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


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """로그인. 성공 시 토큰을 발급합니다."""
    user = db.query(User).filter(User.email == body.email).first()

    # 이메일 불일치 / 비밀번호 불일치를 동일 메시지로 처리 (열거 공격 방지)
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


def _find_user_by_email_nickname(db: Session, email: str, nickname: str) -> User:
    """이메일 + 닉네임으로 유저를 조회. 불일치 시 404 반환."""
    user = db.query(User).filter(User.email == email, User.nickname == nickname).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="이메일 또는 닉네임이 올바르지 않습니다.",
        )
    return user


@router.post("/password-reset/verify", status_code=status.HTTP_200_OK)
def verify_identity(body: PasswordResetRequest, db: Session = Depends(get_db)):
    """1단계: 이메일 + 닉네임 일치 여부 확인. 성공 시 2단계 폼을 표시해도 됩니다."""
    _find_user_by_email_nickname(db, body.email, body.nickname)
    return {"detail": "확인되었습니다. 새 비밀번호를 입력하세요."}


@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
def reset_password(body: PasswordResetConfirmRequest, db: Session = Depends(get_db)):
    """2단계: 새 비밀번호로 변경. 성공 시 로그인 화면으로 이동합니다."""
    user = _find_user_by_email_nickname(db, body.email, body.nickname)
    user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"detail": "비밀번호가 변경되었습니다."}
