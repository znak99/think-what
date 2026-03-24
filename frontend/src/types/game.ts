export type RankLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface Player {
  id: number
  nickname: string
  rank_points: number
  rank_level: RankLevel
}

export interface DrawEvent {
  type: 'draw'
  x0: number
  y0: number
  x1: number
  y1: number
  color: string
  line_width: number
}

export interface ChatMessage {
  id: string
  user_id: number
  nickname: string
  content: string
  is_correct: boolean
  timestamp: number
}

export interface GameState {
  phase: 'waiting' | 'countdown' | 'playing'
  questioner_id: number | null
  consonants: string | null
  time_left: number
  players: Player[]
}
