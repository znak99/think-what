from datetime import datetime
from sqlalchemy import Integer, SmallInteger, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class GameRound(Base):
    __tablename__ = "game_rounds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    word_id: Mapped[int] = mapped_column(Integer, ForeignKey("words.id"), nullable=False)
    questioner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    # 정답자. NULL이면 3분 타임아웃으로 라운드 종료
    winner_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    # 라운드 시작 시점의 참가자 수 (포인트 공식의 n값)
    participant_count: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    # 라운드 시작 후 정답까지 걸린 시간(초). NULL이면 타임아웃
    answered_seconds: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    word: Mapped["Word"] = relationship("Word", back_populates="game_rounds")
    questioner: Mapped["User"] = relationship(
        "User", foreign_keys=[questioner_id], back_populates="rounds_as_questioner"
    )
    winner: Mapped["User | None"] = relationship(
        "User", foreign_keys=[winner_id], back_populates="rounds_as_winner"
    )
    point_log: Mapped["PointLog | None"] = relationship("PointLog", back_populates="round", uselist=False)
