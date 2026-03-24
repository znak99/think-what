"""초기 스키마 생성

Revision ID: 001
Revises:
Create Date: 2026-03-24

테이블 생성 순서 (FK 의존성):
  1. users
  2. words
  3. game_rounds  (→ users, words)
  4. point_logs   (→ users, game_rounds)
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # users
    # ------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("nickname", sa.String(20), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("rank_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("consecutive_correct", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("nickname"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_nickname", "users", ["nickname"], unique=True)
    # MySQL ON UPDATE 절은 server_default로 표현 불가 → ALTER로 추가
    op.execute(
        "ALTER TABLE users MODIFY COLUMN updated_at DATETIME NOT NULL "
        "DEFAULT NOW() ON UPDATE NOW()"
    )

    # ------------------------------------------------------------------
    # words
    # ------------------------------------------------------------------
    op.create_table(
        "words",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("word", sa.String(50), nullable=False),
        sa.Column("consonants", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id"),
    )

    # ------------------------------------------------------------------
    # game_rounds
    # ------------------------------------------------------------------
    op.create_table(
        "game_rounds",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("word_id", sa.Integer(), nullable=False),
        sa.Column("questioner_id", sa.Integer(), nullable=False),
        sa.Column("winner_id", sa.Integer(), nullable=True),
        sa.Column("participant_count", sa.SmallInteger(), nullable=False),
        sa.Column("answered_seconds", sa.SmallInteger(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["word_id"], ["words.id"]),
        sa.ForeignKeyConstraint(["questioner_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["winner_id"], ["users.id"]),
    )
    op.create_index("ix_game_rounds_questioner_id", "game_rounds", ["questioner_id"])
    op.create_index("ix_game_rounds_winner_id", "game_rounds", ["winner_id"])

    # ------------------------------------------------------------------
    # point_logs
    # ------------------------------------------------------------------
    op.create_table(
        "point_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("round_id", sa.Integer(), nullable=False),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["round_id"], ["game_rounds.id"]),
    )
    op.create_index("ix_point_logs_user_id", "point_logs", ["user_id"])


def downgrade() -> None:
    op.drop_table("point_logs")
    op.drop_table("game_rounds")
    op.drop_table("words")
    op.drop_table("users")
