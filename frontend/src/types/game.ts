export type RankLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface PlayerInfo {
  user_id: number
  nickname: string
  rank_points: number
}

// 펜 색상 팔레트 (다크 칠판 기준, 백엔드 ALLOWED_COLORS와 동일)
export const PEN_COLORS = [
  { hex: '#FFFFFF', label: '흰색' },
  { hex: '#F87171', label: '빨간색' },
  { hex: '#FB923C', label: '주황색' },
  { hex: '#FBBF24', label: '노란색' },
  { hex: '#4ADE80', label: '초록색' },
  { hex: '#60A5FA', label: '파란색' },
  { hex: '#818CF8', label: '남색' },
  { hex: '#C084FC', label: '보라색' },
] as const

export const ERASER_COLOR = '#1C2128' // 캔버스 배경색
export const CANVAS_BG = '#1c2128'

// WebSocket 이벤트 타입 ─────────────────────────────────────
export type WsInEventType = 'chat' | 'draw' | 'clear' | 'vote_kick'
export type WsOutEventType =
  | 'chat' | 'correct' | 'draw' | 'clear'
  | 'game_start' | 'game_end'
  | 'player_join' | 'player_leave'
  | 'vote_kick' | 'canvas_replay' | 'error'

export interface DrawEvent {
  x0: number; y0: number
  x1: number; y1: number
  color: string
  width: number
}

export interface ChatMsg {
  id: string
  user_id: number
  nickname: string
  message: string
  isCorrect?: boolean
  isSystem?: boolean
}

export interface VoteStatus {
  votes: number
  required: number
}

export type GamePhase = 'waiting' | 'countdown' | 'playing' | 'round_end'

export interface RoundEndResult {
  winner_id: number | null
  winner_nickname: string | null
  word: string | null
  consonants: string | null
}
