from datetime import datetime
from sqlalchemy import String, Integer, SmallInteger, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    nickname: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rank_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # 연속 정답 수 (streak_bonus 계산용): 정답 시 +1, 출제자 차례 또는 타임아웃 시 0으로 리셋
    consecutive_correct: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    rounds_as_questioner: Mapped[list["GameRound"]] = relationship(
        "GameRound", foreign_keys="GameRound.questioner_id", back_populates="questioner"
    )
    rounds_as_winner: Mapped[list["GameRound"]] = relationship(
        "GameRound", foreign_keys="GameRound.winner_id", back_populates="winner"
    )
    point_logs: Mapped[list["PointLog"]] = relationship("PointLog", back_populates="user")
