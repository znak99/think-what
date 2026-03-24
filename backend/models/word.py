from datetime import datetime
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Word(Base):
    __tablename__ = "words"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    word: Mapped[str] = mapped_column(String(50), nullable=False)        # 실제 단어 (ex: "사자")
    consonants: Mapped[str] = mapped_column(String(20), nullable=False)  # 초성 (ex: "ㅅㅈ")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    game_rounds: Mapped[list["GameRound"]] = relationship("GameRound", back_populates="word")
