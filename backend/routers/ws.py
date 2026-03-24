"""
WebSocket 라우터

연결 URL: ws://host/ws?token=<access_token>
토큰 검증 후 GameRoom에 Player로 등록합니다.
"""
import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from core.security import decode_token
from database import SessionLocal
from game.room import Player, room
from models.user import User
from schemas.ws import DrawPayload, InEvent, InEventType, OutEvent, OutEventType

router = APIRouter(tags=["게임"])


async def _authenticate(token: str) -> User | None:
    """액세스 토큰을 검증하고 User 객체를 반환. 실패 시 None."""
    try:
        from jose import JWTError
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id = int(payload["sub"])
    except Exception:
        return None

    db = SessionLocal()
    try:
        return db.get(User, user_id)
    finally:
        db.close()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    user = await _authenticate(token)
    if user is None:
        await websocket.close(code=4001)  # 인증 실패
        return

    await websocket.accept()

    player = Player(
        user_id=user.id,
        nickname=user.nickname,
        rank_points=user.rank_points,
        websocket=websocket,
    )
    await room.add_player(player)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                event = InEvent(**data)
            except Exception:
                await websocket.send_text(
                    OutEvent(type=OutEventType.ERROR, payload={"detail": "잘못된 메시지 형식입니다."}).model_dump_json()
                )
                continue

            await _handle_event(user.id, event)

    except WebSocketDisconnect:
        await room.remove_player(user.id)


async def _handle_event(user_id: int, event: InEvent) -> None:
    match event.type:
        case InEventType.CHAT:
            await _on_chat(user_id, event.payload)
        case InEventType.DRAW:
            await _on_draw(user_id, event.payload)
        case InEventType.CLEAR:
            await _on_clear(user_id)
        case InEventType.VOTE_KICK:
            await _on_vote_kick(user_id)


async def _on_chat(user_id: int, payload: dict) -> None:
    player = room.players.get(user_id)
    if player is None:
        return

    message = str(payload.get("message", "")).strip()
    if not message:
        return

    # 정답 판정 (참가자만, 출제자 제외)
    if (
        room.is_playing
        and room.questioner_id != user_id
        and room.current_word is not None
        and message == room.current_word
    ):
        await room.broadcast(OutEvent(
            type=OutEventType.CORRECT,
            payload={"user_id": user_id, "nickname": player.nickname, "word": room.current_word},
        ))
        await room.end_round(winner_id=user_id)
        return

    # 일반 채팅 브로드캐스트
    await room.broadcast(OutEvent(
        type=OutEventType.CHAT,
        payload={"user_id": user_id, "nickname": player.nickname, "message": message},
    ))


async def _on_draw(user_id: int, payload: dict) -> None:
    if room.questioner_id != user_id:
        return
    try:
        draw = DrawPayload(**payload)
    except Exception:
        return  # 잘못된 드로잉 페이로드 무시
    event_dict = room.canvas.add(draw)
    if event_dict is None:
        return  # 허용되지 않는 색상 또는 누적 한도 초과
    await room.broadcast(
        OutEvent(type=OutEventType.DRAW, payload=event_dict),
        exclude_id=user_id,
    )


async def _on_clear(user_id: int) -> None:
    if room.questioner_id != user_id:
        return
    room.canvas.clear()
    await room.broadcast(OutEvent(type=OutEventType.CLEAR, payload={}))


async def _on_vote_kick(user_id: int) -> None:
    # 출제자는 투표 불가, 쿨다운 중이면 무시
    if user_id == room.questioner_id or room.vote_cooldown:
        return

    room.vote_set.add(user_id)
    participant_count = len(room.players) - 1  # 출제자 제외

    await room.broadcast(OutEvent(
        type=OutEventType.VOTE_KICK,
        payload={"votes": len(room.vote_set), "required": (participant_count // 2) + 1},
    ))

    # 과반수 달성 시 출제자 재배정
    if len(room.vote_set) > participant_count / 2:
        room.vote_set.clear()
        room.vote_cooldown = True
        # 5분 쿨다운 (비동기 태스크로 처리)
        import asyncio
        asyncio.create_task(_reset_vote_cooldown())
        await room.start_round(word=room.current_word, consonants=room.current_consonants)


async def _reset_vote_cooldown() -> None:
    import asyncio
    await asyncio.sleep(300)  # 5분
    room.vote_cooldown = False
