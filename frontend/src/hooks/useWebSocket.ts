import { useCallback, useEffect, useRef } from 'react'
import type { DrawEvent, WsOutEventType } from '../types/game'

type EventPayload = Record<string, unknown>

type Handlers = {
  [K in WsOutEventType]?: (payload: EventPayload) => void
}

export function useWebSocket(handlers: Handlers) {
  const wsRef = useRef<WebSocket | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    const wsUrl = (import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000') + `/ws?token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as { type: WsOutEventType; payload: EventPayload }
        handlersRef.current[msg.type]?.(msg.payload)
      } catch {
        // 파싱 실패 무시
      }
    }

    ws.onclose = (e) => {
      // 4001 = 인증 실패 → 로그인으로
      if (e.code === 4001) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }))
    }
  }, [])

  const sendChat = useCallback((message: string) => send('chat', { message }), [send])
  const sendDraw = useCallback((e: DrawEvent) => send('draw', e as unknown as Record<string, unknown>), [send])
  const sendClear = useCallback(() => send('clear'), [send])
  const sendVoteKick = useCallback(() => send('vote_kick'), [send])

  return { sendChat, sendDraw, sendClear, sendVoteKick }
}
