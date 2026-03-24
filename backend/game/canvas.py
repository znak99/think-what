"""
캔버스 이벤트 누적 및 재생 관리

- 드로잉 이벤트를 리스트로 누적 보관
- 중간 입장자에게 전체 이벤트 재생
- 라운드 종료/캔버스 초기화 시 리스트 초기화
"""
from schemas.ws import DrawPayload

# 허용 펜 색상 (다크 칠판 캔버스 기준, 8색 + 지우개)
ALLOWED_COLORS: frozenset[str] = frozenset({
    "#FFFFFF",  # 흰색 (기본, 분필 느낌)
    "#F87171",  # 빨간색
    "#FB923C",  # 주황색
    "#FBBF24",  # 노란색
    "#4ADE80",  # 초록색
    "#60A5FA",  # 파란색
    "#818CF8",  # 남색
    "#C084FC",  # 보라색
    "#1C2128",  # 지우개 (캔버스 배경색)
})

MAX_EVENTS = 5000  # 라운드당 누적 이벤트 상한 (메모리 보호)


class CanvasHistory:
    def __init__(self) -> None:
        self._events: list[dict] = []

    def add(self, payload: DrawPayload) -> dict | None:
        """
        이벤트를 검증하고 누적합니다.
        허용되지 않는 색상이면 None 반환 (브로드캐스트 생략).
        """
        if payload.color not in ALLOWED_COLORS:
            return None
        if len(self._events) >= MAX_EVENTS:
            return None

        event_dict = payload.model_dump()
        self._events.append(event_dict)
        return event_dict

    def clear(self) -> None:
        self._events.clear()

    def snapshot(self) -> list[dict]:
        """현재까지의 전체 이벤트 목록 반환 (중간 입장자용)."""
        return list(self._events)
