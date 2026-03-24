"""
GameRoom — 서버 인메모리 게임 상태 싱글턴

단일 방 구조이므로 모듈 레벨 인스턴스를 공유합니다.
모든 상태 변경은 asyncio 단일 스레드에서 실행되므로 별도 Lock 불필요.
"""
import asyncio
import json
import random
from dataclasses import dataclass
from typing import Optional

from fastapi import WebSocket
from database import SessionLocal
from game.canvas import CanvasHistory
from models.word import Word
from schemas.ws import OutEvent, OutEventType


@dataclass
class Player:
    user_id: int
    nickname: str
    rank_points: int
    websocket: WebSocket


class GameRoom:
    def __init__(self) -> None:
        # 접속 중인 플레이어: user_id → Player
        self.players: dict[int, Player] = {}

        # 현재 출제자 user_id (None = 대기 중)
        self.questioner_id: Optional[int] = None
        # 직전 출제자 user_id (재배정 시 제외 대상)
        self.prev_questioner_id: Optional[int] = None

        # 현재 라운드 초성
        self.current_consonants: Optional[str] = None

        # 캔버스 이벤트 누적 (중간 입장자 재생용)
        self.canvas = CanvasHistory()

        # 투표 상태
        self.vote_set: set[int] = set()   # 투표한 user_id
        self.vote_cooldown: bool = False  # 5분 쿨다운 여부

        # 게임 진행 중 여부
        self.is_playing: bool = False

        # 라운드 타이머 태스크
        self._timer_task: Optional[asyncio.Task] = None

    # ------------------------------------------------------------------
    # 플레이어 관리
    # ------------------------------------------------------------------

    async def add_player(self, player: Player) -> None:
        self.players[player.user_id] = player
        await self.broadcast(OutEvent(
            type=OutEventType.PLAYER_JOIN,
            payload={
                "user_id": player.user_id,
                "nickname": player.nickname,
                "rank_points": player.rank_points,
                "player_count": len(self.players),
            },
        ))
        # 캔버스 이벤트 재생 (중간 입장 / 재접속)
        snapshot = self.canvas.snapshot()
        if snapshot:
            await player.websocket.send_text(json.dumps({
                "type": "canvas_replay",
                "payload": {"events": snapshot},
            }))
        # 게임 진행 중 재접속: 현재 게임 상태 전송
        if self.is_playing:
            players_info = [
                {"user_id": p.user_id, "nickname": p.nickname, "rank_points": p.rank_points}
                for p in self.players.values()
            ]
            payload: dict = {
                "questioner_id": self.questioner_id,
                "player_count": len(self.players),
                "players": players_info,
            }
            if player.user_id == self.questioner_id:
                payload["consonants"] = self.current_consonants
            await player.websocket.send_text(
                OutEvent(type=OutEventType.GAME_START, payload=payload).model_dump_json()
            )
            return
        # 2명 이상이면 게임 시작 시도
        if len(self.players) >= 2:
            try:
                await self.start_round()
            except Exception:
                import traceback
                traceback.print_exc()

    async def remove_player(self, user_id: int) -> None:
        self.players.pop(user_id, None)
        await self.broadcast(OutEvent(
            type=OutEventType.PLAYER_LEAVE,
            payload={"user_id": user_id, "player_count": len(self.players)},
        ))
        # 1명 이하면 게임 중단 (출제자 재배정보다 먼저 확인)
        if len(self.players) < 2:
            await self._stop_round()
            return
        # 출제자가 나간 경우 새 출제자 지정
        if self.questioner_id == user_id and self.is_playing:
            await self.start_round()

    # ------------------------------------------------------------------
    # 라운드 관리
    # ------------------------------------------------------------------

    async def start_round(self, consonants: Optional[str] = None) -> None:
        """새 라운드를 시작합니다. consonants 미지정 시 DB에서 무작위 초성을 조회합니다."""
        await self._stop_round()

        # 미지정 시 DB에서 무작위 초성 조회 (Python random으로 MySQL/SQLite 호환)
        if consonants is None:
            db = SessionLocal()
            try:
                count = db.query(Word).count()
                if count > 0:
                    row = db.query(Word).offset(random.randint(0, count - 1)).first()
                    if row:
                        consonants = row.consonants
            finally:
                db.close()

        self.canvas.clear()
        self.vote_set.clear()
        self.is_playing = True
        self.current_consonants = consonants

        # 출제자 선정 (직전 출제자 제외)
        candidates = [uid for uid in self.players if uid != self.prev_questioner_id]
        if not candidates:
            candidates = list(self.players.keys())
        self.questioner_id = random.choice(candidates)
        self.prev_questioner_id = self.questioner_id

        players_info = [
            {"user_id": p.user_id, "nickname": p.nickname, "rank_points": p.rank_points}
            for p in self.players.values()
        ]

        # 참가자에게 브로드캐스트 — 초성은 숨김
        await self.broadcast(
            OutEvent(type=OutEventType.GAME_START, payload={
                "questioner_id": self.questioner_id,
                "player_count": len(self.players),
                "players": players_info,
            }),
            exclude_id=self.questioner_id,
        )
        # 출제자에게만 초성 전송
        await self.send_to(self.questioner_id, OutEvent(
            type=OutEventType.GAME_START,
            payload={
                "questioner_id": self.questioner_id,
                "consonants": consonants,
                "player_count": len(self.players),
                "players": players_info,
            },
        ))

        # 3분 타이머 시작
        self._timer_task = asyncio.create_task(self._round_timer())

    async def _round_timer(self) -> None:
        await asyncio.sleep(180)  # 3분
        if self.is_playing:
            await self.end_round(winner_id=None)

    async def _next_round_after_delay(self) -> None:
        await asyncio.sleep(3)
        if not self.is_playing and len(self.players) >= 2:
            await self.start_round()

    async def end_round(self, winner_id: Optional[int]) -> None:
        await self._stop_round()
        await self.broadcast(OutEvent(
            type=OutEventType.GAME_END,
            payload={
                "winner_id": winner_id,
                "consonants": self.current_consonants,
            },
        ))
        self.current_consonants = None
        # 3초 후 다음 라운드 자동 시작 (2명 이상일 때만)
        if len(self.players) >= 2:
            asyncio.create_task(self._next_round_after_delay())

    async def _stop_round(self) -> None:
        self.is_playing = False
        if self._timer_task and not self._timer_task.done():
            self._timer_task.cancel()
        self._timer_task = None

    # ------------------------------------------------------------------
    # 브로드캐스트
    # ------------------------------------------------------------------

    async def broadcast(self, event: OutEvent, exclude_id: Optional[int] = None) -> None:
        message = event.model_dump_json()
        disconnected = []
        for uid, player in self.players.items():
            if uid == exclude_id:
                continue
            try:
                await player.websocket.send_text(message)
            except Exception:
                disconnected.append(uid)
        for uid in disconnected:
            await self.remove_player(uid)

    async def send_to(self, user_id: int, event: OutEvent) -> None:
        player = self.players.get(user_id)
        if player:
            await player.websocket.send_text(event.model_dump_json())


# 단일 방 싱글턴
room = GameRoom()
