from pydantic import BaseModel, EmailStr, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 8자 이상이어야 합니다.")
        return v

    @field_validator("nickname")
    @classmethod
    def validate_nickname(cls, v: str) -> str:
        if not (4 <= len(v) <= 20):
            raise ValueError("닉네임은 4~20자 사이여야 합니다.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
