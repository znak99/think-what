"""
WebSocket 이벤트 스키마

클라이언트 → 서버 (incoming):
  chat        : 채팅 / 정답 시도
  draw        : 드로잉 이벤트 (출제자만)
  clear       : 캔버스 전체 지우기 (출제자만)
  vote_kick   : 출제자 재배정 투표 (참가자만)

서버 → 클라이언트 (outgoing):
  chat        : 채팅 브로드캐스트
  correct     : 정답 알림
  draw        : 드로잉 이벤트 브로드캐스트
  clear       : 캔버스 초기화 브로드캐스트
  game_start  : 게임 시작 (출제자, 초성, 참가자 목록)
  game_end    : 라운드 종료 (타임아웃 또는 정답)
  player_join : 참가자 입장
  player_leave: 참가자 퇴장
  vote_kick   : 투표 현황 브로드캐스트
"""
from enum import Enum
from typing import Any

from pydantic import BaseModel


class InEventType(str, Enum):
    CHAT = "chat"
    DRAW = "draw"
    CLEAR = "clear"
    VOTE_KICK = "vote_kick"


class OutEventType(str, Enum):
    CHAT = "chat"
    CORRECT = "correct"
    DRAW = "draw"
    CLEAR = "clear"
    GAME_START = "game_start"
    GAME_END = "game_end"
    PLAYER_JOIN = "player_join"
    PLAYER_LEAVE = "player_leave"
    VOTE_KICK = "vote_kick"
    ERROR = "error"


class InEvent(BaseModel):
    type: InEventType
    payload: dict[str, Any] = {}


class OutEvent(BaseModel):
    type: OutEventType
    payload: dict[str, Any] = {}
